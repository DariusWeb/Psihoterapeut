// Paid downloads. Delivery hangs off the Stripe webhook rather than the redirect, so a buyer
// who closes the tab, loses the connection or cancels the save still gets the guide by email.

import { BREVO_EMAIL, brevo } from './brevo.js'
import { CURRENCY, RESOURCES, publicCatalogue } from './catalogue.js'
import { patchDoc, readDoc, writeDoc } from './firestore.js'
import { b64url } from './google-auth.js'
import { createCheckoutSession, retrieveSession, verifyWebhook } from './stripe.js'
import { LIMITS, cleanString, isEmail } from './validate.js'

const ORDERS = 'resourceOrders'

// ponytail: a year, instead of a resend endpoint. Build one when someone actually loses a link.
const TOKEN_TTL_SECONDS = 365 * 86_400

const fromB64url = (value) =>
    Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0))

const signingKey = (env) =>
    crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(env.DOWNLOAD_SIGNING_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    )

// Self-contained, so serving a file costs no database read. Neither a session id nor a resource
// key can contain a dot, which is what makes splitting on it safe.
async function mintToken(env, sessionId, key) {
    const claim = `${sessionId}.${key}.${Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS}`
    const signature = await crypto.subtle.sign('HMAC', await signingKey(env), new TextEncoder().encode(claim))

    return `${claim}.${b64url(signature)}`
}

async function readToken(env, token) {
    const parts = String(token ?? '').split('.')
    if (parts.length !== 4) return null

    const [sessionId, key, expiry, signature] = parts

    try {
        const verified = await crypto.subtle.verify(
            'HMAC',
            await signingKey(env),
            fromB64url(signature),
            new TextEncoder().encode(`${sessionId}.${key}.${expiry}`)
        )

        if (!verified || Number(expiry) < Date.now() / 1000) return null
    } catch {
        return null
    }

    return { sessionId, key }
}

const downloadUrl = async (request, env, sessionId, key) =>
    `${new URL(request.url).origin}/resources/download?t=${encodeURIComponent(await mintToken(env, sessionId, key))}`

export const catalogueResponse = () => ({ ok: true, resources: publicCatalogue() })

export async function handleCheckout(data, env, origin) {
    // Only the key comes from the browser. The amount is read here, so a tampered client
    // sending a price of its own changes nothing — no handler ever looks at one.
    const key = cleanString(data.resourceKey, 40)
    const resource = RESOURCES[key]
    if (!resource) return { ok: false, error: 'unknown_resource' }

    const email = cleanString(data.email, LIMITS.email)
    if (!isEmail(email)) return { ok: false, error: 'invalid_email' }

    // Never take money for a file that is not there. A KV list returns names only, so asking
    // costs far less than reading the guide would.
    const { keys } = await env.RESOURCE_FILES.list({ prefix: resource.file })
    if (!keys.some((entry) => entry.name === resource.file)) return { ok: false, error: 'unavailable' }

    const session = await createCheckoutSession(env, {
        key,
        resource,
        email,
        currency: CURRENCY,
        returnUrl: `${origin}${env.RESOURCE_RETURN_PATH}`
    })

    // Written before the redirect so the people who abandon Stripe are on record too. A lost
    // log must never cost a sale, and the webhook's PATCH recreates the document anyway.
    await writeDoc(env, ORDERS, session.id, {
        email,
        resourceKey: key,
        amount: resource.amount,
        currency: CURRENCY,
        locale: ['en', 'ro'].includes(data.locale) ? data.locale : 'ro',
        pageUrl: cleanString(data.pageUrl, LIMITS.pageUrl),
        consentText: cleanString(data.consentText, LIMITS.consentText),
        consentVersion: cleanString(data.consentVersion, 20),
        status: 'started',
        createdAt: new Date()
    }).catch((error) => console.error('order log failed', error))

    return { ok: true, url: session.url }
}

export async function handleAccess(request, env) {
    const sessionId = new URL(request.url).searchParams.get('session_id') ?? ''
    if (!sessionId.startsWith('cs_')) return { status: 400, body: { ok: false, error: 'bad_session' } }

    // The redirect proves nothing — anyone can type the success URL — so Stripe is asked directly.
    const session = await retrieveSession(env, sessionId)
    if (session.payment_status !== 'paid') return { status: 403, body: { ok: false, error: 'not_paid' } }

    const key = session.metadata?.resourceKey
    if (!RESOURCES[key]) return { status: 404, body: { ok: false, error: 'unknown_resource' } }

    return {
        status: 200,
        body: { ok: true, resourceKey: key, downloadUrl: await downloadUrl(request, env, sessionId, key) }
    }
}

export async function handleDownload(request, env) {
    const url = new URL(request.url)

    const claim = await readToken(env, url.searchParams.get('t'))
    if (!claim) return new Response('Link invalid sau expirat.', { status: 403 })

    const resource = RESOURCES[claim.key]
    if (!resource) return new Response('Resursă indisponibilă.', { status: 404 })

    // ponytail: KV instead of R2, which needs billing enabled. A guide must fit in one 25 MiB
    // value — move to an R2 binding here if anything larger ever goes on sale.
    const file = await env.RESOURCE_FILES.get(resource.file, 'stream')
    if (!file) return new Response('Fișier indisponibil.', { status: 404 })

    return new Response(file, {
        headers: {
            // KV stores no content type. Anything but a PDF downloads rather than mis-renders.
            'Content-Type': resource.file.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
            'Content-Disposition': `${url.searchParams.get('view') ? 'inline' : 'attachment'}; filename="${resource.file}"`,
            'Cache-Control': 'private, no-store'
        }
    })
}

function deliveryEmail(env, { email, resource, link }) {
    return brevo(BREVO_EMAIL, env.BREVO_API_KEY, {
        sender: { email: env.CONTACT_FROM_EMAIL, name: 'Cabinet psihoterapie' },
        to: [{ email }],
        subject: `Ghidul tău: ${resource.name}`,
        htmlContent: `<p>Mulțumesc pentru achiziție.</p>
<p><a href="${link}">Descarcă ${resource.name}</a></p>
<p>Linkul funcționează un an, de pe orice dispozitiv. Păstrează acest email.</p>`
    })
}

export async function handleStripeWebhook(request, env) {
    const event = await verifyWebhook(request, env)
    if (!event) return new Response('bad signature', { status: 400 })

    // Everything else is acknowledged so Stripe stops retrying it.
    if (event.type !== 'checkout.session.completed') return new Response('ignored', { status: 200 })

    const session = event.data.object
    const key = session.metadata?.resourceKey
    const resource = RESOURCES[key]

    // A mismatch means the catalogue moved under a live session: deliver nothing, and shout.
    if (!resource || session.payment_status !== 'paid' || session.amount_total !== resource.amount) {
        console.error('refusing delivery', session.id, key, session.amount_total)
        return new Response('ignored', { status: 200 })
    }

    const email = session.customer_details?.email ?? session.customer_email

    // Recorded before delivery, so a mail failure can never leave a real sale filed as abandoned.
    await patchDoc(env, ORDERS, session.id, {
        email,
        resourceKey: key,
        amount: session.amount_total,
        currency: session.currency,
        status: 'paid',
        paidAt: new Date(),
        paymentIntent: session.payment_intent ?? '',
        billingAddress: session.customer_details?.address ?? null
    })

    // ponytail: read-then-write rather than a transaction. Stripe's retries are seconds apart,
    // so the worst case is a second copy of the email, never a missed one.
    const existing = await readDoc(env, ORDERS, session.id)
    if (existing?.fields?.deliveredAt) return new Response('ok', { status: 200 })

    await deliveryEmail(env, {
        email,
        resource,
        link: await downloadUrl(request, env, session.id, key)
    })

    await patchDoc(env, ORDERS, session.id, { deliveredAt: new Date() })

    return new Response('ok', { status: 200 })
}
