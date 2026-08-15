// Verifies a Firebase ID token without the Admin SDK, which does not run on Workers.
// This is the real gate: the browser is never trusted, and a valid Google account is not
// enough — the uid has to be on the allowlist.

const CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

let certCache = { keys: null, expiresAt: 0 }

const b64urlToBytes = (value) => {
    const b64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

const decodeJson = (segment) => JSON.parse(new TextDecoder().decode(b64urlToBytes(segment)))

// Google rotates these; max-age tells us how long the set stays valid.
async function fetchCerts() {
    if (certCache.keys && Date.now() < certCache.expiresAt) return certCache.keys

    const response = await fetch(CERT_URL)
    if (!response.ok) throw new Error(`cert fetch failed: ${response.status}`)

    const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get('Cache-Control') ?? '')?.[1] ?? 3600)
    certCache = { keys: await response.json(), expiresAt: Date.now() + maxAge * 1000 }

    return certCache.keys
}

// A PEM certificate wraps the public key in a DER structure WebCrypto cannot import, so the
// SubjectPublicKeyInfo has to be cut out of it: Certificate > TBSCertificate > the SPKI, which
// is the first field whose AlgorithmIdentifier carries the RSA OID.
function publicKeyFromCertificate(pem) {
    const der = Uint8Array.from(atob(pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s/g, '')), (c) =>
        c.charCodeAt(0)
    )

    // Reads one tag-length-value triplet, returning where the contents start and end.
    const readNode = (start) => {
        let cursor = start + 1
        let length = der[cursor++]

        if (length & 0x80) {
            const lengthBytes = length & 0x7f
            length = 0
            for (let i = 0; i < lengthBytes; i++) length = (length << 8) | der[cursor++]
        }

        return { tag: der[start], contentStart: cursor, end: cursor + length }
    }

    const RSA_OID = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]

    // Walk the SEQUENCEs looking for one shaped like SPKI: SEQUENCE { SEQUENCE { OID }, BIT STRING }
    const findSpki = (start, end) => {
        let cursor = start

        while (cursor < end) {
            const node = readNode(cursor)
            if (node.end > end) break

            if (node.tag === 0x30) {
                const inner = readNode(node.contentStart)
                if (inner.tag === 0x30) {
                    const oid = readNode(inner.contentStart)
                    if (
                        oid.tag === 0x06 &&
                        oid.end - oid.contentStart === RSA_OID.length &&
                        RSA_OID.every((byte, i) => der[oid.contentStart + i] === byte)
                    ) {
                        return der.slice(cursor, node.end)
                    }
                }

                const found = findSpki(node.contentStart, node.end)
                if (found) return found
            }

            cursor = node.end
        }

        return null
    }

    const certificate = readNode(0)
    const spki = findSpki(certificate.contentStart, certificate.end)
    if (!spki) throw new Error('no RSA public key found in certificate')

    return spki
}

export async function verifyIdToken(idToken, projectId) {
    if (typeof idToken !== 'string' || idToken.split('.').length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = idToken.split('.')

    let header, payload
    try {
        header = decodeJson(headerB64)
        payload = decodeJson(payloadB64)
    } catch {
        return null
    }

    if (header.alg !== 'RS256' || !header.kid) return null

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp <= now) return null
    if (payload.iat > now) return null
    if (payload.auth_time > now) return null
    if (payload.aud !== projectId) return null
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null
    if (typeof payload.sub !== 'string' || !payload.sub) return null

    const certs = await fetchCerts()
    const pem = certs[header.kid]
    if (!pem) return null

    const key = await crypto.subtle.importKey(
        'spki',
        publicKeyFromCertificate(pem),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    )

    const valid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        b64urlToBytes(signatureB64),
        new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    )

    return valid ? { uid: payload.sub, email: payload.email } : null
}

// Signing in with any Google account is not authorisation — the uid must be listed.
export async function authorizeAdmin(request, env) {
    const header = request.headers.get('Authorization') ?? ''
    if (!header.startsWith('Bearer ')) return null

    const allowed = (env.ADMIN_UIDS ?? '').split(',').map((uid) => uid.trim()).filter(Boolean)
    if (!allowed.length) return null

    const user = await verifyIdToken(header.slice(7), env.FIREBASE_PROJECT_ID)

    return user && allowed.includes(user.uid) ? user : null
}
