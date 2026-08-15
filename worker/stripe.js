// Every Stripe call goes through here. Raw REST rather than the SDK: the package is far larger
// than the three calls this site makes, and form-encoding nested params costs ten lines.

const API = 'https://api.stripe.com/v1'

const TOLERANCE_SECONDS = 300

// Stripe reads bracketed paths out of a form body: line_items[0][price_data][currency].
// Arrays fall out of Object.entries as "0", "1", … which is exactly the shape it wants.
function toForm(value, prefix = '', form = new URLSearchParams()) {
    if (value === null || value === undefined) return form

    if (typeof value !== 'object') {
        form.append(prefix, String(value))
        return form
    }

    for (const [key, child] of Object.entries(value)) {
        toForm(child, prefix ? `${prefix}[${key}]` : key, form)
    }

    return form
}

async function stripe(env, path, body) {
    const response = await fetch(`${API}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
        },
        body: body ? toForm(body) : undefined
    })

    if (!response.ok) throw new Error(`Stripe ${response.status}: ${await response.text()}`)

    return response.json()
}

export function createCheckoutSession(env, { key, resource, email, currency, returnUrl }) {
    return stripe(env, '/checkout/sessions', {
        mode: 'payment',
        customer_email: email,
        // Collected now so these sales are still invoiceable once e-Factura is wired up, and
        // because EU VAT needs a second piece of location evidence beyond the card country.
        billing_address_collection: 'required',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: returnUrl,
        metadata: { resourceKey: key },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency,
                    unit_amount: resource.amount,
                    product_data: { name: resource.name }
                }
            }
        ]
    })
}

export function retrieveSession(env, id) {
    return stripe(env, `/checkout/sessions/${encodeURIComponent(id)}`)
}

function hexToBytes(hex) {
    if (hex.length % 2 || !/^[0-9a-f]+$/i.test(hex)) return null
    return Uint8Array.from(hex.match(/../g), (byte) => parseInt(byte, 16))
}

// Returns the parsed event, or null for anything that is not provably from Stripe.
export async function verifyWebhook(request, env) {
    // The raw text, never a re-serialised object: JSON.stringify reorders and respaces, and the
    // signature is over the exact bytes Stripe sent.
    const body = await request.text()

    const fields = (request.headers.get('Stripe-Signature') ?? '').split(',').map((part) => part.split('='))
    const timestamp = fields.find(([name]) => name === 't')?.[1]
    // v1 repeats while a signing secret is being rotated, and either value is valid.
    const signatures = fields.filter(([name]) => name === 'v1').map(([, value]) => value)

    if (!timestamp || !signatures.length) return null

    // Written as a failed <= so a junk timestamp lands on NaN and is rejected, not skipped.
    if (!(Math.abs(Date.now() / 1000 - Number(timestamp)) <= TOLERANCE_SECONDS)) return null

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    )

    const signed = new TextEncoder().encode(`${timestamp}.${body}`)

    for (const signature of signatures) {
        const bytes = hexToBytes(signature)
        if (bytes && (await crypto.subtle.verify('HMAC', key, bytes, signed))) {
            try {
                return JSON.parse(body)
            } catch {
                return null
            }
        }
    }

    return null
}
