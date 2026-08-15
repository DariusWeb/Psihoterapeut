// Mints Firebase-shaped ID tokens signed by a throwaway key, and serves the matching
// certificate, so tests exercise the real signature path instead of stubbing it out.

import { createSign, generateKeyPairSync } from 'node:crypto'

export const PROJECT_ID = 'psihoterapeut-test'
export const ADMIN_UID = 'uid-andreea'

const encodeLength = (length) => {
    if (length < 0x80) return Buffer.from([length])
    const bytes = []
    for (let n = length; n > 0; n >>= 8) bytes.unshift(n & 0xff)
    return Buffer.from([0x80 | bytes.length, ...bytes])
}

// Certificate ::= SEQUENCE { TBSCertificate, AlgorithmIdentifier, BIT STRING }. Only the
// nested SPKI matters — that is what the verifier digs out.
function wrapInCertificate(spki) {
    const seq = (contents) => Buffer.concat([Buffer.from([0x30]), encodeLength(contents.length), contents])
    const tbs = seq(Buffer.concat([Buffer.from([0x02, 0x01, 0x02]), spki]))
    return seq(Buffer.concat([tbs, Buffer.from([0x05, 0x00]), Buffer.from([0x03, 0x02, 0x00, 0x00])]))
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })

export const signingKey = privateKey
export const otherKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey

const der = wrapInCertificate(publicKey.export({ type: 'spki', format: 'der' }))
export const certPem = `-----BEGIN CERTIFICATE-----\n${der.toString('base64')}\n-----END CERTIFICATE-----`

export const b64url = (buffer) => Buffer.from(buffer).toString('base64url')

export const now = () => Math.floor(Date.now() / 1000)

export function signToken(claims, key = signingKey, header = { alg: 'RS256', kid: 'test-kid' }) {
    const body = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`
    const signature = createSign('RSA-SHA256').update(body).end().sign(key)
    return `${body}.${b64url(signature)}`
}

export const validClaims = (overrides = {}) => ({
    sub: ADMIN_UID,
    aud: PROJECT_ID,
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    iat: now() - 60,
    auth_time: now() - 60,
    exp: now() + 3600,
    email: 'andreea@example.com',
    ...overrides
})

// Replaces the certificate endpoint while leaving every other fetch to the caller's stub.
export function installCertStub(passthrough) {
    const original = globalThis.fetch

    globalThis.fetch = async (url, options) => {
        if (String(url).includes('securetoken@system.gserviceaccount.com')) {
            return new Response(JSON.stringify({ 'test-kid': certPem }), {
                status: 200,
                headers: { 'Cache-Control': 'max-age=3600' }
            })
        }

        return (passthrough ?? original)(url, options)
    }
}
