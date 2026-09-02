// The only entry point: every route is gated here — origin, rate limit, then Turnstile — before
// a handler ever sees the request.

import { availableSlots, bookingConfigured, handleBooking } from './handlers/booking.js'
import { handleContact } from './handlers/contact.js'
import { readLive, readLiveAdmin, writeLive } from './handlers/live.js'
import { addLike, likesConfigured, readLikes } from './handlers/likes.js'
import { handleNewsletter } from './handlers/newsletter.js'
import {
    catalogueResponse,
    handleAccess,
    handleCheckout,
    handleDownload,
    handleStripeWebhook
} from './handlers/resources.js'
import { verifyTurnstile } from './lib/turnstile.js'
import { authorizeAdmin } from './lib/verify-token.js'

const json = (status, body, origin) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
    })

function corsHeaders(origin) {
    return origin
        ? {
              'Access-Control-Allow-Origin': origin,
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        : {}
}

const withinRateLimit = async (env, ip) => (await env.SUBMIT_RATE_LIMIT.limit({ key: ip })).success

function allowedOrigin(request, env) {
    const origin = request.headers.get('Origin')
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)
    return allowed.includes(origin) ? origin : null
}

const ROUTES = {
    '/newsletter': handleNewsletter,
    '/contact': handleContact,
    '/booking': handleBooking,
    '/resources/checkout': handleCheckout,
    '/likes': addLike
}
const NO_CAPTCHA = new Set(['/likes'])

export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url)
        const origin = allowedOrigin(request, env)

        // The binding rejects a null key, and Cloudflare only sets this header in production.
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown'

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(origin) })
        }

        // Dispatched above the origin gate: neither a Stripe callback nor a link clicked in an
        // email sends an Origin, and each carries its own signature to be authorised by.
        if (pathname === '/stripe/webhook') {
            if (request.method !== 'POST') return new Response('method', { status: 405 })

            try {
                return await handleStripeWebhook(request, env)
            } catch (error) {
                // A 5xx is what makes Stripe retry, so a Firestore or Brevo blip is not a lost sale.
                console.error(error)
                return new Response('delivery failed', { status: 500 })
            }
        }

        if (pathname === '/resources/download' && request.method === 'GET') {
            return handleDownload(request, env)
        }

        if (!origin) return json(403, { ok: false, error: 'forbidden_origin' }, null)

        if (pathname === '/resources/catalogue' && request.method === 'GET') {
            return json(200, catalogueResponse(), origin)
        }

        if (pathname === '/resources/access' && request.method === 'GET') {
            // Unauthenticated and it calls Stripe, so it is rate limited like a write.
            if (!(await withinRateLimit(env, ip))) {
                return json(429, { ok: false, error: 'rate_limited' }, origin)
            }

            try {
                const { status, body } = await handleAccess(request, env)
                return json(status, body, origin)
            } catch (error) {
                console.error(error)
                return json(502, { ok: false, error: 'upstream_failed' }, origin)
            }
        }

        if (pathname === '/likes' && request.method === 'GET') {
            if (!likesConfigured(env)) return json(503, { ok: false, error: 'not_configured' }, origin)
            return json(200, await readLikes(request, env), origin)
        }

        if (pathname === '/live' && request.method === 'GET') {
            return json(200, await readLive(env), origin)
        }

        // Free slots are public by design, and nothing but start times leaves the calendar —
        // there is no detail here to gate behind a challenge.
        if (pathname === '/booking/slots' && request.method === 'GET') {
            if (!bookingConfigured(env)) return json(503, { ok: false, error: 'not_configured' }, origin)

            // Every call is a live Google Calendar read, so it gets the same brake as a write.
            if (!(await withinRateLimit(env, ip))) {
                return json(429, { ok: false, error: 'rate_limited' }, origin)
            }

            try {
                return json(200, await availableSlots(env), origin)
            } catch (error) {
                console.error(error)
                return json(502, { ok: false, error: 'calendar_unavailable' }, origin)
            }
        }

        // Dashboard routes: a signed-in, allowlisted Google account, verified server-side.
        // The browser is never trusted — the Vue route guard is only there for the UX.
        if (pathname === '/live' || pathname === '/live/state') {
            if (!(await withinRateLimit(env, ip))) {
                return json(429, { ok: false, error: 'rate_limited' }, origin)
            }

            if (!(await authorizeAdmin(request, env))) {
                return json(403, { ok: false, error: 'forbidden' }, origin)
            }

            if (pathname === '/live/state') {
                const { status, body } = await readLiveAdmin(env)
                return json(status, body, origin)
            }

            const { status, body } = await writeLive(request, env)
            return json(status, body, origin)
        }

        if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, origin)

        const handler = ROUTES[pathname]
        if (!handler) return json(404, { ok: false, error: 'not_found' }, origin)

        if (pathname === '/likes' && !likesConfigured(env)) {
            return json(503, { ok: false, error: 'not_configured' }, origin)
        }

        if (!(await withinRateLimit(env, ip))) {
            return json(429, { ok: false, error: 'rate_limited' }, origin)
        }

        let data
        try {
            data = await request.json()
        } catch {
            return json(400, { ok: false, error: 'bad_json' }, origin)
        }

        if (!NO_CAPTCHA.has(pathname) &&
            !(await verifyTurnstile(data.turnstileToken, ip, env.TURNSTILE_SECRET_KEY))) {
            return json(403, { ok: false, error: 'failed_captcha' }, origin)
        }

        try {
            const result = await handler(data, env, origin)
            return json(result.ok ? 200 : 400, result, origin)
        } catch (error) {
            console.error(error)
            return json(502, { ok: false, error: 'upstream_failed' }, origin)
        }
    }
}
