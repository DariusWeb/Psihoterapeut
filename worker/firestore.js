// Brevo hides double-opt-in signups until they confirm, so an independent log is the only
// way to see who subscribed and never clicked through. Written here, never from the browser.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/datastore'

let cached = null

const b64url = (bytes) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

function pemToPkcs8(pem) {
    const body = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s/g, '')
    return Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
}

async function accessToken(serviceAccount) {
    if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

    const now = Math.floor(Date.now() / 1000)
    const claim = {
        iss: serviceAccount.client_email,
        scope: SCOPE,
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
    cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 }

    return access_token
}

export async function logSignup(env, { email, locale, source, consentText, consentVersion, pageUrl }) {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
    const token = await accessToken(serviceAccount)

    const url = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/newsletterConsent?documentId=${crypto.randomUUID()}`

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            fields: {
                email: { stringValue: email },
                locale: { stringValue: locale },
                source: { stringValue: source },
                consentText: { stringValue: consentText },
                consentVersion: { stringValue: consentVersion },
                pageUrl: { stringValue: pageUrl },
                // Brevo owns the confirmation itself; this only records that the form was submitted.
                confirmed: { booleanValue: false },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        })
    })

    if (!response.ok) throw new Error(`Firestore write failed: ${response.status} ${await response.text()}`)
}
