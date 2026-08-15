// Verifies Turnstile, then talks to Brevo server-side. The browser never touches Brevo directly:
// its form hosts are on EasyPrivacy, so ad blockers were silently killing signups.

import { BREVO_CONTACTS, BREVO_EMAIL, brevo } from './brevo.js'
import { availableSlots, bookingConfigured, handleBooking } from './calendar.js'
import { logSignup } from './firestore.js'
import { readLive, readLiveAdmin, writeLive } from './live.js'
import {
    catalogueResponse,
    handleAccess,
    handleCheckout,
    handleDownload,
    handleStripeWebhook
} from './resources.js'
import { LIMITS, cleanString, isEmail } from './validate.js'
import { authorizeAdmin } from './verify-token.js'

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

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

function allowedOrigin(request, env) {
    const origin = request.headers.get('Origin')
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)
    return allowed.includes(origin) ? origin : null
}

async function verifyTurnstile(token, ip, secret) {
    if (!token) return false

    const body = new FormData()
    body.append('secret', secret)
    body.append('response', token)
    if (ip !== 'unknown') body.append('remoteip', ip)

    const response = await fetch(TURNSTILE_VERIFY, { method: 'POST', body })
    if (!response.ok) return false

    return (await response.json()).success === true
}

// Brevo sends the opt-in email and only creates the contact once it is confirmed, so the
// confirmation timestamp and IP it records are the consent proof — nothing is stored here.
async function handleNewsletter(data, env) {
    const email = cleanString(data.email, LIMITS.email)
    if (!isEmail(email)) return { ok: false, error: 'invalid_email' }

    // Logged before Brevo so the record survives a Brevo failure, and never blocks the
    // subscription: a lost log is recoverable, a lost signup is not.
    if (env.FIREBASE_SERVICE_ACCOUNT) {
        await logSignup(env, {
            email,
            locale: ['en', 'ro'].includes(data.locale) ? data.locale : 'ro',
            source: 'newsletter-form',
            consentText: cleanString(data.consentText, LIMITS.consentText),
            consentVersion: cleanString(data.consentVersion, 20),
            pageUrl: cleanString(data.pageUrl, LIMITS.pageUrl)
        }).catch((error) => console.error('signup log failed', error))
    }

    await brevo(BREVO_CONTACTS, env.BREVO_API_KEY, {
        email,
        includeListIds: [Number(env.BREVO_LIST_ID)],
        templateId: Number(env.BREVO_OPTIN_TEMPLATE_ID),
        redirectionUrl: env.BREVO_OPTIN_REDIRECT_URL,
        attributes: {
            CONSENT_TEXT: cleanString(data.consentText, LIMITS.consentText),
            CONSENT_VERSION: cleanString(data.consentVersion, 20),
            CONSENT_URL: cleanString(data.pageUrl, LIMITS.pageUrl),
            CONSENT_AT: new Date().toISOString(),
            LOCALE: ['en', 'ro'].includes(data.locale) ? data.locale : 'ro'
        }
    })

    return { ok: true }
}

async function handleContact(data, env) {
    const email = cleanString(data.email, LIMITS.email)
    const name = cleanString(data.name, LIMITS.name)
    const message = cleanString(data.message, LIMITS.message)
    const phone = cleanString(data.phone, LIMITS.phone)

    if (!isEmail(email) || !name || !message) return { ok: false, error: 'invalid_fields' }

    const lines = [
        `Nume: ${name}`,
        `Email: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        '',
        message,
        '',
        `— trimis din formularul de contact (${cleanString(data.pageUrl, LIMITS.pageUrl)})`,
        `Consimțământ: ${cleanString(data.consentText, LIMITS.consentText)}`
    ].filter((line) => line !== null)

    await brevo(BREVO_EMAIL, env.BREVO_API_KEY, {
        sender: { email: env.CONTACT_FROM_EMAIL, name: 'Formular contact' },
        to: [{ email: env.CONTACT_TO_EMAIL }],
        replyTo: { email, name },
        subject: `Mesaj nou de la ${name}`,
        textContent: lines.join('\n')
    })

    return { ok: true }
}

const ROUTES = {
    '/newsletter': handleNewsletter,
    '/contact': handleContact,
    '/booking': handleBooking,
    '/resources/checkout': handleCheckout
}

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
            try {
                const { status, body } = await handleAccess(request, env)
                return json(status, body, origin)
            } catch (error) {
                console.error(error)
                return json(502, { ok: false, error: 'upstream_failed' }, origin)
            }
        }

        if (pathname === '/live' && request.method === 'GET') {
            return json(200, await readLive(env), origin)
        }

        // Free slots are public by design, and nothing but start times leaves the calendar —
        // there is no detail here to gate behind a challenge.
        if (pathname === '/booking/slots' && request.method === 'GET') {
            if (!bookingConfigured(env)) return json(503, { ok: false, error: 'not_configured' }, origin)

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
            const { success: withinWriteLimit } = await env.SUBMIT_RATE_LIMIT.limit({ key: ip })
            if (!withinWriteLimit) return json(429, { ok: false, error: 'rate_limited' }, origin)

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

        const { success: withinLimit } = await env.SUBMIT_RATE_LIMIT.limit({ key: ip })
        if (!withinLimit) return json(429, { ok: false, error: 'rate_limited' }, origin)

        let data
        try {
            data = await request.json()
        } catch {
            return json(400, { ok: false, error: 'bad_json' }, origin)
        }

        if (!(await verifyTurnstile(data.turnstileToken, ip, env.TURNSTILE_SECRET_KEY))) {
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
