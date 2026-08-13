// A service-account access token, signed with WebCrypto because Google's own SDKs do not run
// on Workers. Cached per account and scope — a token exchange on every request would be absurd.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

const cache = new Map()

const b64url = (bytes) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

function pemToPkcs8(pem) {
    const body = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s/g, '')
    return Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
}

export async function accessToken(serviceAccount, scope) {
    const cacheKey = `${serviceAccount.client_email}|${scope}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

    const now = Math.floor(Date.now() / 1000)
    const claim = {
        iss: serviceAccount.client_email,
        scope,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600
    }

    const unsigned = `${b64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))}.${b64url(new TextEncoder().encode(JSON.stringify(claim)))}`

    const key = await crypto.subtle.importKey(
        'pkcs8',
        pemToPkcs8(serviceAccount.private_key),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
    const assertion = `${unsigned}.${b64url(signature)}`

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
    })

    if (!response.ok) throw new Error(`Google token exchange failed: ${response.status} ${await response.text()}`)

    const { access_token, expires_in } = await response.json()
    cache.set(cacheKey, { token: access_token, expiresAt: Date.now() + expires_in * 1000 })

    return access_token
}
