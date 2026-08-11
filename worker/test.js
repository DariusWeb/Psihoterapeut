// Run: node worker/test.js
// The load-bearing check: a request without a valid Turnstile token must never reach Brevo.

import assert from 'node:assert'
import worker from './index.js'

const ORIGIN = 'https://dariusweb.github.io'

const env = {
    ALLOWED_ORIGINS: ORIGIN,
    TURNSTILE_SECRET_KEY: 'secret',
    BREVO_API_KEY: 'brevo-key',
    BREVO_LIST_ID: '1',
    BREVO_OPTIN_TEMPLATE_ID: '2',
    CONTACT_TO_EMAIL: 'to@example.com',
    CONTACT_FROM_EMAIL: 'from@example.com',
    SUBMIT_RATE_LIMIT: { limit: async () => ({ success: true }) }
}

let brevoCalls = []
let turnstilePasses = true

globalThis.fetch = async (url) => {
    if (String(url).includes('siteverify')) {
        return new Response(JSON.stringify({ success: turnstilePasses }), { status: 200 })
    }
    brevoCalls.push(String(url))
    return new Response('{}', { status: 201 })
}

const post = (path, body, origin = ORIGIN) =>
    worker.fetch(
        new Request(`https://worker.dev${path}`, {
            method: 'POST',
            headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
            body: JSON.stringify(body)
        }),
        env
    )

const valid = { email: 'a@b.co', locale: 'ro', consentText: 'ok', turnstileToken: 'tok' }

async function run(name, fn) {
    brevoCalls = []
    turnstilePasses = true
    await fn()
    console.log(`  ok  ${name}`)
}

await run('missing token is rejected and never reaches Brevo', async () => {
    const res = await post('/newsletter', { ...valid, turnstileToken: undefined })
    assert.equal(res.status, 403)
    assert.deepEqual(brevoCalls, [])
})

await run('failed challenge is rejected and never reaches Brevo', async () => {
    turnstilePasses = false
    const res = await post('/newsletter', valid)
    assert.equal(res.status, 403)
    assert.deepEqual(brevoCalls, [])
})

await run('valid newsletter submit reaches Brevo', async () => {
    const res = await post('/newsletter', valid)
    assert.equal(res.status, 200)
    assert.equal(brevoCalls.length, 1)
})

await run('foreign origin is refused before anything else', async () => {
    const res = await post('/newsletter', valid, 'https://evil.example')
    assert.equal(res.status, 403)
    assert.deepEqual(brevoCalls, [])
})

await run('rate limit short-circuits before Brevo', async () => {
    const res = await post('/newsletter', valid)
    assert.equal(res.status, 200)
    const limited = await worker.fetch(
        new Request('https://worker.dev/newsletter', {
            method: 'POST',
            headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
            body: JSON.stringify(valid)
        }),
        { ...env, SUBMIT_RATE_LIMIT: { limit: async () => ({ success: false }) } }
    )
    assert.equal(limited.status, 429)
})

await run('invalid email is rejected after a passing challenge', async () => {
    const res = await post('/newsletter', { ...valid, email: 'not-an-email' })
    assert.equal(res.status, 400)
    assert.deepEqual(brevoCalls, [])
})

await run('contact requires name and message', async () => {
    const res = await post('/contact', { ...valid, name: '', message: '' })
    assert.equal(res.status, 400)
    assert.deepEqual(brevoCalls, [])
})

await run('valid contact submit reaches Brevo', async () => {
    const res = await post('/contact', { ...valid, name: 'Ana', message: 'Salut' })
    assert.equal(res.status, 200)
    assert.equal(brevoCalls.length, 1)
})

await run('unknown route is a 404', async () => {
    const res = await post('/whatever', valid)
    assert.equal(res.status, 404)
})

console.log('\nall worker checks passed')
