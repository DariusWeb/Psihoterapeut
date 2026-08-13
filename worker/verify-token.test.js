// Run: node worker/verify-token.test.js
// The load-bearing check: a token this Worker did not get from Google, or from a uid that is
// not allowlisted, must never authorise a write. Tokens here are signed with a throwaway key
// and the certificate endpoint is stubbed, so the real signature path is exercised.

import assert from 'node:assert'
import {
    ADMIN_UID as UID,
    PROJECT_ID,
    b64url,
    installCertStub,
    otherKey,
    now,
    signToken,
    signingKey,
    validClaims
} from './test-tokens.js'

installCertStub()

const { verifyIdToken, authorizeAdmin } = await import('./verify-token.js')

const env = { FIREBASE_PROJECT_ID: PROJECT_ID, ADMIN_UIDS: UID }

const bearer = (token) => new Request('https://worker.dev/live', { headers: { Authorization: `Bearer ${token}` } })

async function run(name, fn) {
    await fn()
    console.log(`  ok  ${name}`)
}

await run('a correctly signed token verifies', async () => {
    const user = await verifyIdToken(signToken(validClaims()), PROJECT_ID)
    assert.equal(user.uid, UID)
    assert.equal(user.email, 'andreea@example.com')
})

await run('a token signed by another key is rejected', async () => {
    assert.equal(await verifyIdToken(signToken(validClaims(), otherKey), PROJECT_ID), null)
})

// The classic forgery: keep the signature, swap the uid in the payload.
await run('a tampered payload is rejected', async () => {
    const token = signToken(validClaims())
    const [header, , signature] = token.split('.')
    const forged = `${header}.${b64url(JSON.stringify(validClaims({ sub: 'uid-attacker' })))}.${signature}`

    assert.equal(await verifyIdToken(forged, PROJECT_ID), null)
})

await run('an expired token is rejected', async () => {
    assert.equal(await verifyIdToken(signToken(validClaims({ exp: now() - 10 })), PROJECT_ID), null)
})

await run('a token issued in the future is rejected', async () => {
    assert.equal(await verifyIdToken(signToken(validClaims({ iat: now() + 600 })), PROJECT_ID), null)
})

// A token minted for a different Firebase project must not work here.
await run('a token for another project is rejected', async () => {
    assert.equal(await verifyIdToken(signToken(validClaims({ aud: 'other-project' })), PROJECT_ID), null)
})

await run('a wrong issuer is rejected', async () => {
    assert.equal(await verifyIdToken(signToken(validClaims({ iss: 'https://evil.example' })), PROJECT_ID), null)
})

await run('alg none is rejected', async () => {
    const token = signToken(validClaims(), signingKey, { alg: 'none', kid: 'test-kid' })
    assert.equal(await verifyIdToken(token, PROJECT_ID), null)
})

await run('an unknown kid is rejected', async () => {
    const token = signToken(validClaims(), signingKey, { alg: 'RS256', kid: 'not-a-real-kid' })
    assert.equal(await verifyIdToken(token, PROJECT_ID), null)
})

await run('malformed tokens are rejected', async () => {
    for (const bad of ['', 'abc', 'a.b', 'a.b.c.d', null, undefined, 42]) {
        assert.equal(await verifyIdToken(bad, PROJECT_ID), null)
    }
})

// Signing in with any Google account is not authorisation.
await run('a valid token from a non-allowlisted uid is refused', async () => {
    const token = signToken(validClaims({ sub: 'uid-stranger' }))
    assert.equal(await authorizeAdmin(bearer(token), env), null)
})

await run('a valid token from an allowlisted uid is authorised', async () => {
    const user = await authorizeAdmin(bearer(signToken(validClaims())), env)
    assert.equal(user.uid, UID)
})

await run('an empty allowlist authorises nobody', async () => {
    const token = signToken(validClaims())
    assert.equal(await authorizeAdmin(bearer(token), { ...env, ADMIN_UIDS: '' }), null)
})

await run('a missing Authorization header is refused', async () => {
    assert.equal(await authorizeAdmin(new Request('https://worker.dev/live'), env), null)
})

console.log('\nall token checks passed')
