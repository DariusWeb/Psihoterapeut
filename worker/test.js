// Run: node worker/test.js
// The load-bearing check: a request without a valid Turnstile token must never reach Brevo.

import assert from 'node:assert'
import { ADMIN_UID, PROJECT_ID, installCertStub, signToken, validClaims } from './test-tokens.js'

const ORIGIN = 'https://dariusweb.github.io'

const adminToken = signToken(validClaims())
const strangerToken = signToken(validClaims({ sub: 'uid-stranger' }))

const worker = (await import('./index.js')).default

const env = {
    ALLOWED_ORIGINS: ORIGIN,
    TURNSTILE_SECRET_KEY: 'secret',
    BREVO_API_KEY: 'brevo-key',
    BREVO_LIST_ID: '1',
    BREVO_OPTIN_TEMPLATE_ID: '2',
    CONTACT_TO_EMAIL: 'to@example.com',
    CONTACT_FROM_EMAIL: 'from@example.com',
    FIREBASE_PROJECT_ID: PROJECT_ID,
    ADMIN_UIDS: ADMIN_UID,
    LIVE: kvMock(),
    // Mirrors the real binding, which throws on a null key rather than coercing it.
    SUBMIT_RATE_LIMIT: {
        limit: async ({ key }) => {
            if (typeof key !== 'string' || !key) throw new Error('rate limit key must be a non-empty string')
            return { success: true }
        }
    }
}

// Only the three methods live.js uses. `expirationTtl` is recorded, not enforced —
// the assertions check that a TTL was requested, not that Cloudflare honours it.
function kvMock() {
    const store = new Map()
    return {
        store,
        get: async (key, type) => {
            const entry = store.get(key)
            if (!entry) return null
            return type === 'json' ? JSON.parse(entry.value) : entry.value
        },
        put: async (key, value, options = {}) => void store.set(key, { value, ...options }),
        delete: async (key) => void store.delete(key)
    }
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

// Layered after the stub above so cert fetches are served without counting as Brevo calls.
installCertStub(globalThis.fetch)

const post = (path, body, origin = ORIGIN, ip = '1.2.3.4') => {
    const headers = { Origin: origin, 'Content-Type': 'application/json' }
    if (ip) headers['CF-Connecting-IP'] = ip

    return worker.fetch(new Request(`https://worker.dev${path}`, { method: 'POST', headers, body: JSON.stringify(body) }), env)
}

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

// The signup log is the only view of people who subscribe and never confirm, since Brevo
// hides pending double-opt-in contacts — but losing it must never cost a real subscription.
await run('a failing signup log still lets the subscription through', async () => {
    const res = await worker.fetch(
        new Request('https://worker.dev/newsletter', {
            method: 'POST',
            headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
            body: JSON.stringify(valid)
        }),
        { ...env, FIREBASE_SERVICE_ACCOUNT: '{"not":"valid json for a service account"}' }
    )
    assert.equal(res.status, 200)
    assert.equal(brevoCalls.length, 1)
})

// Regression: workerd sets no CF-Connecting-IP outside production, and a null rate-limit
// key crashed the request into a 500 that leaked past the captcha check as an opaque error.
await run('missing CF-Connecting-IP still rejects cleanly, not a 500', async () => {
    turnstilePasses = false
    const res = await post('/newsletter', valid, ORIGIN, null)
    assert.equal(res.status, 403)
    assert.deepEqual(brevoCalls, [])
})

// ── live announcement banner ────────────────────────────────────────────────

const getLive = () =>
    worker.fetch(new Request('https://worker.dev/live', { headers: { Origin: ORIGIN } }), env)

// Signed with the throwaway key from the auth fixture, so the real verification path runs.
const setLive = (body, token = adminToken) =>
    worker.fetch(
        new Request('https://worker.dev/live', {
            method: 'POST',
            headers: {
                Origin: ORIGIN,
                'Content-Type': 'application/json',
                'CF-Connecting-IP': '1.2.3.4',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(body)
        }),
        env
    )

const announcement = {
    title: 'Sunt live pe YouTube',
    text: 'Intră acum',
    ctaLabel: 'Vezi',
    url: 'https://youtube.com/live/abc',
    platform: 'youtube',
    delayMinutes: 0,
    durationMinutes: 120
}

async function runLive(name, fn) {
    env.LIVE.store.clear()
    await fn()
    console.log(`  ok  ${name}`)
}

await runLive('no announcement reads as not live', async () => {
    assert.deepEqual(await (await getLive()).json(), { live: false })
})

await runLive('a published announcement is visible immediately', async () => {
    assert.equal((await setLive(announcement)).status, 200)

    const body = await (await getLive()).json()
    assert.equal(body.live, true)
    assert.equal(body.title, 'Sunt live pe YouTube')
    assert.equal(body.url, 'https://youtube.com/live/abc')
    // startsAt is a server-side scheduling detail; visitors have no use for it
    assert.equal(body.startsAt, undefined)
})

// The load-bearing check: scheduling is resolved on the Worker's clock, so a delayed
// announcement must stay invisible even though the KV key already exists.
await runLive('a delayed announcement stays hidden until its start time', async () => {
    await setLive({ ...announcement, delayMinutes: 10 })
    assert.deepEqual(await (await getLive()).json(), { live: false })

    const stored = JSON.parse(env.LIVE.store.get('announcement').value)
    stored.startsAt = Date.now() - 1000
    env.LIVE.store.set('announcement', { value: JSON.stringify(stored) })

    assert.equal((await (await getLive()).json()).live, true)
})

// The delay is inside the TTL, or a scheduled banner would expire before appearing.
await runLive('the key expires after delay + duration', async () => {
    await setLive({ ...announcement, delayMinutes: 10, durationMinutes: 30 })
    assert.equal(env.LIVE.store.get('announcement').expirationTtl, 40 * 60)
})

await runLive('"until I stop it" stores no expiry', async () => {
    await setLive({ ...announcement, durationMinutes: 0 })
    assert.equal(env.LIVE.store.get('announcement').expirationTtl, undefined)
})

await runLive('a forged token is refused and writes nothing', async () => {
    const res = await setLive(announcement, 'not.a.token')
    assert.equal(res.status, 403)
    assert.equal(env.LIVE.store.size, 0)
})

await runLive('no token is refused and writes nothing', async () => {
    const res = await setLive(announcement, null)
    assert.equal(res.status, 403)
    assert.equal(env.LIVE.store.size, 0)
})

// Signing in with any Google account is not authorisation.
await runLive('a valid token from a non-allowlisted uid writes nothing', async () => {
    const res = await setLive(announcement, strangerToken)
    assert.equal(res.status, 403)
    assert.equal(env.LIVE.store.size, 0)
})

// A stored javascript: URL would run in every visitor's page from the CTA href.
await runLive('a non-https link is refused and writes nothing', async () => {
    const res = await setLive({ ...announcement, url: 'javascript:alert(1)' })
    assert.equal(res.status, 400)
    assert.equal(env.LIVE.store.size, 0)
})

await runLive('a missing title is refused', async () => {
    const res = await setLive({ ...announcement, title: '   ' })
    assert.equal(res.status, 400)
    assert.equal(env.LIVE.store.size, 0)
})

await runLive('off clears the announcement', async () => {
    await setLive(announcement)
    assert.equal((await setLive({ off: true })).status, 200)
    assert.deepEqual(await (await getLive()).json(), { live: false })
})

const adminState = (token) =>
    worker.fetch(
        new Request('https://worker.dev/live/state', {
            method: 'POST',
            headers: {
                Origin: ORIGIN,
                'CF-Connecting-IP': '1.2.3.4',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        }),
        env
    )

await runLive('the dashboard state endpoint reports a pending announcement', async () => {
    await setLive({ ...announcement, delayMinutes: 20 })

    const state = await (await adminState(adminToken)).json()
    assert.equal(state.state, 'scheduled')
    assert.equal(state.minutesUntilVisible, 20)
})

// A scheduled announcement is not public until it starts, so its contents must not leak.
// Regression: the dashboard sends Authorization, which triggers a CORS preflight. Omitting
// the header from the allowlist let every unit test pass while the browser blocked the call.
await runLive('the preflight allows the Authorization header', async () => {
    const res = await worker.fetch(
        new Request('https://worker.dev/live', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
        env
    )

    assert.equal(res.status, 204)
    assert.match(res.headers.get('Access-Control-Allow-Headers'), /Authorization/i)
})

await runLive('the dashboard state endpoint refuses an unauthorised caller', async () => {
    await setLive({ ...announcement, delayMinutes: 20 })

    const res = await adminState(strangerToken)
    assert.equal(res.status, 403)
    assert.equal((await res.json()).announcement, undefined)
})

console.log('\nall worker checks passed')
