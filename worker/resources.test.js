// Run: node worker/resources.test.js
// The load-bearing checks: the browser can never choose what it is charged, and nothing is
// delivered without a signature that only Stripe or this Worker could have produced.

import assert from 'node:assert'
import { RESOURCES } from './catalogue.js'
import { b64url } from './google-auth.js'
import { signingKey } from './test-tokens.js'

const ORIGIN = 'https://dariusweb.github.io'
const WEBHOOK_SECRET = 'whsec_test_secret'
const SESSION_ID = 'cs_test_session_1'

const worker = (await import('./index.js')).default

const bucket = new Map([['loss.pdf', 'a pdf'], ['identity.pdf', 'another pdf']])

const env = {
    ALLOWED_ORIGINS: ORIGIN,
    TURNSTILE_SECRET_KEY: 'secret',
    BREVO_API_KEY: 'brevo-key',
    CONTACT_FROM_EMAIL: 'from@example.com',
    STRIPE_SECRET_KEY: 'sk_test_key',
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    DOWNLOAD_SIGNING_KEY: 'download-signing-key',
    RESOURCE_RETURN_PATH: '/Psihoterapeut/resurse',
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify({
        project_id: 'psihoterapeut',
        client_email: 'forms@test.iam.gserviceaccount.com',
        private_key: signingKey.export({ type: 'pkcs8', format: 'pem' })
    }),
    RESOURCE_FILES: {
        get: async (name) => bucket.get(name) ?? null,
        list: async ({ prefix }) => ({
            keys: [...bucket.keys()].filter((name) => name.startsWith(prefix)).map((name) => ({ name }))
        })
    },
    SUBMIT_RATE_LIMIT: { limit: async () => ({ success: true }) }
}

let stripeCalls = []
let brevoCalls = []
let firestore = new Map()
let turnstilePasses = true
let paymentStatus = 'paid'

globalThis.fetch = async (url, options = {}) => {
    const target = String(url)

    if (target.includes('siteverify')) {
        return new Response(JSON.stringify({ success: turnstilePasses }), { status: 200 })
    }

    if (target.includes('oauth2.googleapis.com/token')) {
        return new Response(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }), { status: 200 })
    }

    if (target.includes('firestore.googleapis.com')) {
        const docId = decodeURIComponent(target.match(/resourceOrders(?:\/|\?documentId=)([^?&]+)/)?.[1] ?? '')

        if (options.method === 'POST' || options.method === 'PATCH') {
            const { fields } = JSON.parse(options.body)
            firestore.set(docId, { fields: { ...firestore.get(docId)?.fields, ...fields } })
            return new Response('{}', { status: 200 })
        }

        const doc = firestore.get(docId)
        return doc ? new Response(JSON.stringify(doc), { status: 200 }) : new Response('{}', { status: 404 })
    }

    if (target.includes('api.stripe.com')) {
        stripeCalls.push({ target, body: new URLSearchParams(options.body ?? '') })

        if (options.method === 'POST') {
            return new Response(JSON.stringify({ id: SESSION_ID, url: 'https://checkout.stripe.com/pay/cs_test' }), { status: 200 })
        }

        return new Response(
            JSON.stringify({
                id: SESSION_ID,
                payment_status: paymentStatus,
                metadata: { resourceKey: 'loss' },
                customer_details: { email: 'ana@example.com' }
            }),
            { status: 200 }
        )
    }

    brevoCalls.push(JSON.parse(options.body))
    return new Response('{}', { status: 201 })
}

const checkout = (body) =>
    worker.fetch(
        new Request('https://worker.dev/resources/checkout', {
            method: 'POST',
            headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
            body: JSON.stringify(body)
        }),
        env
    )

const get = (path, headers = {}) =>
    worker.fetch(new Request(`https://worker.dev${path}`, { headers }), env)

const toHex = (buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')

async function sign(payload, timestamp, secret = WEBHOOK_SECRET) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`)))
}

const completedEvent = (overrides = {}) =>
    JSON.stringify({
        type: 'checkout.session.completed',
        data: {
            object: {
                id: SESSION_ID,
                payment_status: 'paid',
                amount_total: RESOURCES.loss.amount,
                currency: 'ron',
                metadata: { resourceKey: 'loss' },
                customer_details: { email: 'ana@example.com', address: { country: 'RO' } },
                payment_intent: 'pi_test_1',
                ...overrides
            }
        }
    })

async function webhook(payload, { timestamp = Math.floor(Date.now() / 1000), signature } = {}) {
    return worker.fetch(
        new Request('https://worker.dev/stripe/webhook', {
            method: 'POST',
            headers: { 'Stripe-Signature': `t=${timestamp},v1=${signature ?? (await sign(payload, timestamp))}` },
            body: payload
        }),
        env
    )
}

async function run(name, fn) {
    stripeCalls = []
    brevoCalls = []
    firestore = new Map()
    turnstilePasses = true
    paymentStatus = 'paid'
    await fn()
    console.log(`  ok  ${name}`)
}

const valid = { resourceKey: 'loss', email: 'ana@example.com', turnstileToken: 'tok' }

// ── the price is not the browser's to choose ────────────────────────────────

// The whole design rests on this: the request names a resource, never an amount.
await run('a price sent by the client is ignored', async () => {
    const res = await checkout({ ...valid, price: 10, amount: 1, unit_amount: 1 })

    assert.equal(res.status, 200)
    assert.equal(stripeCalls.length, 1)
    assert.equal(
        stripeCalls[0].body.get('line_items[0][price_data][unit_amount]'),
        String(RESOURCES.loss.amount)
    )
})

await run('an unknown resource is refused and no session is created', async () => {
    const res = await checkout({ ...valid, resourceKey: 'not-a-guide' })

    assert.equal(res.status, 400)
    assert.equal((await res.json()).error, 'unknown_resource')
    assert.deepEqual(stripeCalls, [])
})

// Taking money for a guide that was never uploaded is worse than refusing the sale.
await run('a resource with no uploaded file cannot be bought', async () => {
    const res = await checkout({ ...valid, resourceKey: 'balance' })

    assert.equal(res.status, 400)
    assert.equal((await res.json()).error, 'unavailable')
    assert.deepEqual(stripeCalls, [])
})

await run('checkout still needs a passing challenge', async () => {
    turnstilePasses = false
    const res = await checkout(valid)

    assert.equal(res.status, 403)
    assert.deepEqual(stripeCalls, [])
})

await run('an invalid email is refused before Stripe', async () => {
    const res = await checkout({ ...valid, email: 'not-an-email' })

    assert.equal(res.status, 400)
    assert.deepEqual(stripeCalls, [])
})

// Everyone who reaches Stripe is on record, so the ones who never come back are visible.
await run('an abandoned checkout is left recorded as started', async () => {
    await checkout(valid)

    assert.equal(firestore.get(SESSION_ID).fields.status.stringValue, 'started')
    assert.equal(firestore.get(SESSION_ID).fields.email.stringValue, 'ana@example.com')
})

await run('the buyer is sent back to the origin they started from', async () => {
    await checkout(valid)

    assert.equal(
        stripeCalls[0].body.get('success_url'),
        `${ORIGIN}/Psihoterapeut/resurse?session_id={CHECKOUT_SESSION_ID}`
    )
})

// ── nothing is delivered without a real Stripe signature ────────────────────

await run('a forged signature delivers nothing', async () => {
    const payload = completedEvent()
    const res = await webhook(payload, { signature: await sign(payload, Math.floor(Date.now() / 1000), 'wrong-secret') })

    assert.equal(res.status, 400)
    assert.deepEqual(brevoCalls, [])
    assert.equal(firestore.size, 0)
})

// Without the window check, a captured webhook could be replayed forever.
await run('a stale timestamp delivers nothing', async () => {
    const res = await webhook(completedEvent(), { timestamp: Math.floor(Date.now() / 1000) - 3600 })

    assert.equal(res.status, 400)
    assert.deepEqual(brevoCalls, [])
})

await run('a missing signature header delivers nothing', async () => {
    const res = await worker.fetch(
        new Request('https://worker.dev/stripe/webhook', { method: 'POST', body: completedEvent() }),
        env
    )

    assert.equal(res.status, 400)
    assert.deepEqual(brevoCalls, [])
})

// A catalogue edit mid-session must not be honoured at whatever Stripe happened to collect.
await run('an amount that disagrees with the catalogue delivers nothing', async () => {
    const res = await webhook(completedEvent({ amount_total: 100 }))

    assert.equal(res.status, 200)
    assert.deepEqual(brevoCalls, [])
})

await run('an unpaid session delivers nothing', async () => {
    const res = await webhook(completedEvent({ payment_status: 'unpaid' }))

    assert.equal(res.status, 200)
    assert.deepEqual(brevoCalls, [])
})

await run('a valid webhook records the sale and emails the guide', async () => {
    const res = await webhook(completedEvent())

    assert.equal(res.status, 200)
    assert.equal(brevoCalls.length, 1)
    assert.equal(brevoCalls[0].to[0].email, 'ana@example.com')
    assert.match(brevoCalls[0].htmlContent, /\/resources\/download\?t=/)

    const order = firestore.get(SESSION_ID).fields
    assert.equal(order.status.stringValue, 'paid')
    assert.equal(order.paymentIntent.stringValue, 'pi_test_1')
    assert.ok(order.deliveredAt)
})

// Stripe retries on any non-2xx, and it retries successes it never saw the response to.
await run('a replayed webhook does not send a second email', async () => {
    await webhook(completedEvent())
    await webhook(completedEvent())

    assert.equal(brevoCalls.length, 1)
})

// ── the download link is the only way to the file ───────────────────────────

async function purchase() {
    await webhook(completedEvent())
    return new URL(brevoCalls[0].htmlContent.match(/href="([^"]+)"/)[1]).searchParams.get('t')
}

await run('a valid token serves the file', async () => {
    const res = await get(`/resources/download?t=${encodeURIComponent(await purchase())}`)

    assert.equal(res.status, 200)
    assert.equal(await res.text(), 'a pdf')
    assert.match(res.headers.get('Content-Disposition'), /^attachment/)
})

// The gate has to work for an email client and a new tab, neither of which sends an Origin.
await run('the download works without an Origin header', async () => {
    const token = await purchase()
    const res = await worker.fetch(
        new Request(`https://worker.dev/resources/download?t=${encodeURIComponent(token)}`),
        env
    )

    assert.equal(res.status, 200)
})

await run('view=1 renders in place instead of downloading', async () => {
    const res = await get(`/resources/download?t=${encodeURIComponent(await purchase())}&view=1`)

    assert.match(res.headers.get('Content-Disposition'), /^inline/)
})

// Swapping the key for a dearer guide is the obvious attack on a self-contained token.
await run('a token repointed at another guide is refused', async () => {
    const [session, , expiry, signature] = (await purchase()).split('.')
    const res = await get(`/resources/download?t=${session}.identity.${expiry}.${signature}`)

    assert.equal(res.status, 403)
})

await run('a token with a stretched expiry is refused', async () => {
    const [session, key, expiry, signature] = (await purchase()).split('.')
    const res = await get(`/resources/download?t=${session}.${key}.${Number(expiry) + 86_400}.${signature}`)

    assert.equal(res.status, 403)
})

// Signed correctly, for a moment that has already passed — only the clock rejects this one.
await run('an expired token is refused', async () => {
    const claim = `${SESSION_ID}.loss.${Math.floor(Date.now() / 1000) - 60}`

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(env.DOWNLOAD_SIGNING_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(claim)))
    const res = await get(`/resources/download?t=${encodeURIComponent(`${claim}.${signature}`)}`)

    assert.equal(res.status, 403)
})

await run('a missing token is refused', async () => {
    assert.equal((await get('/resources/download')).status, 403)
})

// ── the return path trusts Stripe, not the URL ──────────────────────────────

await run('access is granted for a session Stripe confirms is paid', async () => {
    const res = await get(`/resources/access?session_id=${SESSION_ID}`, { Origin: ORIGIN })
    const body = await res.json()

    assert.equal(res.status, 200)
    assert.equal(body.resourceKey, 'loss')
    assert.match(body.downloadUrl, /\/resources\/download\?t=/)
})

// Anyone can type the success URL, so the redirect alone must never unlock a file.
await run('access is refused for a session Stripe reports unpaid', async () => {
    paymentStatus = 'unpaid'
    const res = await get(`/resources/access?session_id=${SESSION_ID}`, { Origin: ORIGIN })

    assert.equal(res.status, 403)
    assert.equal((await res.json()).error, 'not_paid')
})

await run('the public catalogue carries prices but no file names', async () => {
    const body = await (await get('/resources/catalogue', { Origin: ORIGIN })).json()

    assert.equal(body.resources.length, Object.keys(RESOURCES).length)
    assert.equal(body.resources.find((r) => r.key === 'loss').amount, RESOURCES.loss.amount)
    assert.ok(body.resources.every((resource) => resource.file === undefined))
})

console.log('\nall resource checks passed')
