// Run: node worker/test/worker.test.js
// The load-bearing check: a request without a valid Turnstile token must never reach Brevo.

import assert from 'node:assert'
import { ADMIN_UID, PROJECT_ID, installCertStub, signToken, signingKey, validClaims } from './tokens.js'

const ORIGIN = 'https://dariusweb.github.io'
const CALENDAR_ID = 'disponibil@group.calendar.google.com'

// Three days out, so the 24h lead time never eats the window whatever time the suite runs at.
const windowStart = new Date(Date.now() + 3 * 86_400_000).setUTCHours(8, 0, 0, 0)

const timed = (from, minutes) => ({
    start: { dateTime: new Date(from).toISOString() },
    end: { dateTime: new Date(from + minutes * 60_000).toISOString() }
})

// Created by hand in the app: an open window.
const openWindow = (from = windowStart, hours = 4) => timed(from, hours * 60)

// Written by the Worker: a booking, and only the tag tells them apart.
const bookedSlot = (iso) => ({
    ...timed(Date.parse(iso), 50),
    extendedProperties: { private: { siteBooking: '1' } }
})

const adminToken = signToken(validClaims())
const strangerToken = signToken(validClaims({ sub: 'uid-stranger' }))

const worker = (await import('../index.js')).default

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
    // Set in production, so the suite has to run with the consent log switched on — without it
    // logSignup is skipped entirely and could no-op forever unnoticed.
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify({
        project_id: 'psihoterapeut-test',
        client_email: 'forms@test.iam.gserviceaccount.com',
        private_key: signingKey.export({ type: 'pkcs8', format: 'pem' })
    }),
    // A real key, so the token exchange runs the real WebCrypto signing path.
    GOOGLE_CALENDAR_SERVICE_ACCOUNT: JSON.stringify({
        client_email: 'booking@test.iam.gserviceaccount.com',
        private_key: signingKey.export({ type: 'pkcs8', format: 'pem' })
    }),
    BOOKING_CALENDAR_ID: CALENDAR_ID,
    BOOKING_TIMEZONE: 'Europe/Bucharest',
    BOOKING_SLOT_MINUTES: '50',
    BOOKING_STEP_MINUTES: '60',
    BOOKING_LEAD_HOURS: '24',
    BOOKING_DAYS_AHEAD: '7',
    LIVE: kvMock(),
    LIKES: kvMock(),
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
let calendarItems = []
let calendarInserts = []
let firestoreWrites = []

globalThis.fetch = async (url, options) => {
    const target = String(url)

    if (target.includes('siteverify')) {
        return new Response(JSON.stringify({ success: turnstilePasses }), { status: 200 })
    }

    if (target.includes('oauth2.googleapis.com/token')) {
        return new Response(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }), { status: 200 })
    }

    if (target.includes('/calendar/v3/calendars/')) {
        if (options?.method !== 'POST') {
            return new Response(JSON.stringify({ items: calendarItems }), { status: 200 })
        }

        calendarInserts.push(JSON.parse(options.body))
        return new Response('{"id":"evt_1"}', { status: 200 })
    }

    if (target.includes('firestore.googleapis.com')) {
        firestoreWrites.push(JSON.parse(options.body).fields)
        return new Response('{}', { status: 200 })
    }

    // Matched by host rather than used as a fallback: a stray call to anything else would
    // otherwise be counted as a Brevo call and quietly satisfy an assertion.
    if (target.includes('api.brevo.com')) {
        brevoCalls.push({ target, body: JSON.parse(options.body) })
        return new Response('{}', { status: 201 })
    }

    throw new Error(`unstubbed request to ${target}`)
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
    firestoreWrites = []
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

// These five attributes are the consent proof Brevo stores against the contact. Dropping one
// would leave the double opt-in unprovable while every other assertion here still passed.
await run('the newsletter payload carries the consent attributes', async () => {
    await post('/newsletter', {
        ...valid,
        consentText: 'Sunt de acord',
        consentVersion: 'v2',
        pageUrl: 'https://site.ro/newsletter'
    })

    const { attributes, includeListIds, templateId } = brevoCalls[0].body
    assert.equal(attributes.CONSENT_TEXT, 'Sunt de acord')
    assert.equal(attributes.CONSENT_VERSION, 'v2')
    assert.equal(attributes.CONSENT_URL, 'https://site.ro/newsletter')
    assert.equal(attributes.LOCALE, 'ro')
    assert.ok(Date.parse(attributes.CONSENT_AT))
    assert.deepEqual(includeListIds, [1])
    assert.equal(templateId, 2)
})

// The failure case below only proves a broken log is survivable; without this, a log that never
// ran at all would look identical.
await run('a successful signup is written to the consent log', async () => {
    await post('/newsletter', { ...valid, consentText: 'Sunt de acord', consentVersion: 'v2' })

    assert.equal(firestoreWrites.length, 1)
    assert.equal(firestoreWrites[0].email.stringValue, 'a@b.co')
    assert.equal(firestoreWrites[0].consentText.stringValue, 'Sunt de acord')
    assert.equal(firestoreWrites[0].source.stringValue, 'newsletter-form')
    // Brevo owns the confirmation; this row only records that the form was submitted.
    assert.equal(firestoreWrites[0].confirmed.booleanValue, false)
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

// A mail that arrives without the message in it is worse than one that never arrives.
await run('valid contact submit reaches Brevo', async () => {
    const res = await post('/contact', { ...valid, name: 'Ana', message: 'Salut' })
    assert.equal(res.status, 200)
    assert.equal(brevoCalls.length, 1)

    const { textContent, replyTo, to } = brevoCalls[0].body
    assert.match(textContent, /Salut/)
    assert.match(textContent, /Ana/)
    // Replying to the notification has to reach the visitor, not the mailbox it was sent to.
    assert.equal(replyTo.email, 'a@b.co')
    assert.equal(to[0].email, 'to@example.com')
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

// ── booking ─────────────────────────────────────────────────────────────────

const getSlots = (overrides = {}) =>
    worker.fetch(new Request('https://worker.dev/booking/slots', { headers: { Origin: ORIGIN } }), {
        ...env,
        ...overrides
    })

const booking = { name: 'Ana', email: 'ana@example.com', phone: '0700000000', mode: 'online', turnstileToken: 'tok' }

async function runBooking(name, fn) {
    brevoCalls = []
    calendarInserts = []
    turnstilePasses = true
    calendarItems = [openWindow()]
    await fn()
    console.log(`  ok  ${name}`)
}

// A 4-hour window, 50-minute sessions on an hourly grid anchored to the window's own start.
await runBooking('an availability window becomes a grid of start times', async () => {
    const body = await (await getSlots()).json()

    assert.equal(body.ok, true)
    assert.equal(body.slotMinutes, 50)
    assert.deepEqual(
        body.slots,
        [0, 1, 2, 3].map((hour) => new Date(windowStart + hour * 3_600_000).toISOString())
    )
})

// The 24h lead time is why every other booking test puts its window three days out — nothing
// was checking that a window inside it is actually withheld.
await runBooking('a window inside the lead time offers nothing', async () => {
    calendarItems = [openWindow(Date.now() + 2 * 3_600_000)]

    assert.deepEqual((await (await getSlots()).json()).slots, [])
})

// All-day entries carry a bare date, which parses to NaN. Skipping them is what stops one from
// landing in `busy` as [NaN, NaN], where every isFree comparison is false and the whole day's
// real availability disappears.
await runBooking('an all-day entry never eats a real window', async () => {
    calendarItems = [
        openWindow(),
        {
            start: { date: '2030-01-01' },
            end: { date: '2030-01-02' },
            extendedProperties: { private: { siteBooking: '1' } }
        }
    ]

    assert.equal((await (await getSlots()).json()).slots.length, 4)
})

// The load-bearing check: the tag is the only thing separating a booking from an open window.
await runBooking('a tagged booking removes exactly the slot it covers', async () => {
    const before = (await (await getSlots()).json()).slots
    const taken = before[2]

    calendarItems = [openWindow(), bookedSlot(taken)]

    const after = (await (await getSlots()).json()).slots
    assert.ok(!after.includes(taken))
    assert.equal(after.length, before.length - 1)
})

// Without the allowlist check the form is a write handle on the calendar: any instant at all.
await runBooking('a start time off the grid is refused and nothing is inserted', async () => {
    const res = await post('/booking', { ...booking, start: '2030-01-01T03:17:00.000Z' })

    assert.equal(res.status, 400)
    assert.equal((await res.json()).error, 'slot_unavailable')
    assert.deepEqual(calendarInserts, [])
    assert.deepEqual(brevoCalls, [])
})

await runBooking('a valid booking lands in the calendar and mails both sides', async () => {
    const start = (await (await getSlots()).json()).slots[0]
    const res = await post('/booking', { ...booking, message: 'Aș vrea să încep', start })

    assert.equal(res.status, 200)
    assert.equal(calendarInserts.length, 1)
    assert.equal(brevoCalls.length, 2)

    const event = calendarInserts[0]
    assert.match(event.description, /ana@example\.com/)
    assert.equal(event.start.dateTime, start)
    assert.equal(Date.parse(event.end.dateTime) - Date.parse(start), 50 * 60_000)
    // Untagged it would be read back as an open window; with attendees Google refuses the insert.
    assert.equal(event.extendedProperties.private.siteBooking, '1')
    assert.equal(event.attendees, undefined)
})

await runBooking('a booking still needs a passing challenge', async () => {
    turnstilePasses = false
    const res = await post('/booking', { ...booking, start: '2030-01-01T10:00:00.000Z' })

    assert.equal(res.status, 403)
    assert.deepEqual(calendarInserts, [])
})

const getLikes = (query, origin = ORIGIN) =>
    worker.fetch(new Request(`https://worker.dev/likes?${query}`, { headers: { Origin: origin } }), env)

const like = (body) =>
    worker.fetch(
        new Request('https://worker.dev/likes', {
            method: 'POST',
            headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }),
        env
    )

async function runLikes(name, fn) {
    env.LIKES.store.clear()
    await run(name, fn)
}

await runLikes('an unknown slug counts zero rather than failing', async () => {
    const res = await getLikes('slugs=nobody-liked-this')

    assert.equal(res.status, 200)
    assert.deepEqual((await res.json()).counts, { 'nobody-liked-this': 0 })
})

await runLikes('a like increments, and reads back at the new count', async () => {
    assert.equal((await (await like({ slug: 'un-atelier' })).json()).count, 1)
    assert.equal((await (await like({ slug: 'un-atelier' })).json()).count, 2)

    const counts = (await (await getLikes('slugs=un-atelier')).json()).counts
    assert.equal(counts['un-atelier'], 2)
})

await runLikes('slugs are counted separately', async () => {
    await like({ slug: 'unu' })
    await like({ slug: 'doi' })
    await like({ slug: 'doi' })

    const counts = (await (await getLikes('slugs=unu,doi')).json()).counts
    assert.deepEqual(counts, { unu: 1, doi: 2 })
})

// The KV key is built from the slug, so anything but a plain slug must never reach it.
await runLikes('a malformed slug is refused and writes nothing', async () => {
    for (const slug of ['../secret', 'has space', 'UPPER', '', 'x'.repeat(81), 42, null]) {
        const res = await like({ slug })

        assert.equal(res.status, 400, `accepted ${JSON.stringify(slug)}`)
        assert.equal((await res.json()).error, 'invalid_fields')
    }

    assert.equal(env.LIKES.store.size, 0)
})

await runLikes('a like needs no captcha but still answers the origin gate', async () => {
    const res = await worker.fetch(
        new Request('https://worker.dev/likes', {
            method: 'POST',
            headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: 'un-atelier' })
        }),
        env
    )

    assert.equal(res.status, 403)
    assert.equal(env.LIKES.store.size, 0)
})

await runLikes('the route reports itself unconfigured when the namespace is missing', async () => {
    const { LIKES: _LIKES, ...withoutKv } = env
    const res = await worker.fetch(
        new Request('https://worker.dev/likes?slugs=unu', { headers: { Origin: ORIGIN } }),
        withoutKv
    )

    assert.equal(res.status, 503)
    assert.equal((await res.json()).error, 'not_configured')
})

console.log('\nall worker checks passed')
