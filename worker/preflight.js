// Run: node worker/preflight.js
// Checks the things that otherwise fail silently in production: unfilled config, a Turnstile
// secret that is not really a secret, and a Brevo key that cannot see the list or template.

import { readFileSync } from 'node:fs'

const REQUIRED_VARS = ['ALLOWED_ORIGINS', 'BREVO_LIST_ID', 'BREVO_OPTIN_TEMPLATE_ID', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']

let failed = 0
const pass = (m) => console.log(`  ok    ${m}`)
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++ }
const skip = (m) => console.log(`  skip  ${m}`)
const check = (ok, okMessage, failMessage) => (ok ? pass(okMessage) : fail(failMessage))

const toml = readFileSync(new URL('./wrangler.toml', import.meta.url), 'utf8')
const readVar = (name) => toml.match(new RegExp(`^${name}\\s*=\\s*"([^"]*)"`, 'm'))?.[1] ?? ''

console.log('\nwrangler.toml')
for (const name of REQUIRED_VARS) {
    const value = readVar(name)
    check(value, `${name} = ${value}`, `${name} is empty — fill it before deploying`)
}

// Brevo's UI shows ids as "#5"; the API needs the bare integer, and Number('#5') is NaN.
for (const name of ['BREVO_LIST_ID', 'BREVO_OPTIN_TEMPLATE_ID']) {
    const value = readVar(name)
    if (value) check(/^\d+$/.test(value), `${name} is a plain integer`, `${name} = "${value}" — use the bare number, no "#" or spaces`)
}

for (const name of ['CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']) {
    const value = readVar(name)
    if (value) check(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), `${name} looks like an address`, `${name} = "${value}" is not a valid email`)
}

const origins = readVar('ALLOWED_ORIGINS').split(',').map((o) => o.trim()).filter(Boolean)

// http is allowed only for localhost, where TLS is not available and the origin cannot be
// sent by anything but a local dev server. Every deployed host still has to be https.
const isLocalhost = (origin) => /^http:\/\/localhost(:\d+)?$/.test(origin)

check(
    origins.every((o) => o.startsWith('https://') || isLocalhost(o)),
    `origins are https, or localhost (${origins.length})`,
    'every ALLOWED_ORIGINS entry must be an https origin (or http://localhost:PORT), with no trailing slash or path'
)

console.log('\ndashboard')
check(
    /^\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*"[0-9a-f]{8,}"/m.test(toml),
    'KV namespace id is filled',
    'the LIVE kv_namespaces id is empty — run: npx wrangler kv namespace create LIVE --config worker/wrangler.toml'
)

check(
    readVar('FIREBASE_PROJECT_ID'),
    `FIREBASE_PROJECT_ID = ${readVar('FIREBASE_PROJECT_ID')}`,
    'FIREBASE_PROJECT_ID is empty — ID tokens cannot be validated against a project'
)

// An empty allowlist locks everyone out, including you; it is not a safe default to ship.
const adminUids = readVar('ADMIN_UIDS').split(',').map((uid) => uid.trim()).filter(Boolean)
check(
    adminUids.length,
    `ADMIN_UIDS lists ${adminUids.length} account(s)`,
    'ADMIN_UIDS is empty — nobody can sign in. Add your Firebase uid.'
)

// Booking is opt-in: an empty calendar id means the feature is off, and that must not block
// a deploy of everything else.
console.log('\nbooking')
const calendarId = readVar('BOOKING_CALENDAR_ID')
const eventsUrl = (id) => `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events`

if (!calendarId) {
    skip('BOOKING_CALENDAR_ID is empty — booking is off, /booking/slots will answer not_configured')
} else {
    // The two that otherwise fail silently in production: a calendar that was never shared, and
    // one that is readable but empty — which looks identical to a broken integration on the page.
    const serviceAccount = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT
    if (!serviceAccount) {
        skip('GOOGLE_CALENDAR_SERVICE_ACCOUNT not in env — export it to check the calendar is shared')
    } else {
        const { accessToken } = await import('./google-auth.js')
        const token = await accessToken(JSON.parse(serviceAccount), 'https://www.googleapis.com/auth/calendar')

        const query = new URLSearchParams({
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 21 * 86_400_000).toISOString(),
            singleEvents: 'true',
            maxResults: '2500'
        })

        const listed = await fetch(`${eventsUrl(calendarId)}?${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (!listed.ok) {
            fail(`cannot read ${calendarId} (${listed.status}) — share it with the service account's client_email`)
        } else {
            pass(`${calendarId} is shared with the service account`)

            const items = (await listed.json()).items ?? []
            const timed = items.filter((item) => item.start?.dateTime)
            const windows = timed.filter((item) => !item.extendedProperties?.private?.siteBooking)

            check(
                windows.length,
                `${windows.length} open window(s) in the next 21 days, ${timed.length - windows.length} booked`,
                `${calendarId} has no open windows in the next 21 days — the booking page will show nothing`
            )
        }
    }
}

// Paid downloads are opt-in the same way booking is: no bucket means the feature is off, and
// that must not block a deploy of everything else.
console.log('\npaid resources')
const returnPath = readVar('RESOURCE_RETURN_PATH')

check(
    /binding\s*=\s*"RESOURCE_FILES"\s*\n\s*id\s*=\s*"[0-9a-f]{8,}"/m.test(toml),
    'RESOURCE_FILES namespace id is filled',
    'RESOURCE_FILES is not bound — run: npx wrangler kv namespace create RESOURCE_FILES --config worker/wrangler.toml'
)

// Joined onto a request origin, so a missing leading slash silently builds a broken return URL.
check(
    returnPath.startsWith('/') && !returnPath.endsWith('/'),
    `RESOURCE_RETURN_PATH = ${returnPath}`,
    `RESOURCE_RETURN_PATH = "${returnPath}" — must start with "/" and have no trailing slash`
)

const stripeKey = process.env.STRIPE_SECRET_KEY

if (!stripeKey) {
    skip('STRIPE_SECRET_KEY not in env — export it to check the key against Stripe')
} else if (stripeKey.startsWith('pk_')) {
    fail('STRIPE_SECRET_KEY is a publishable key — the secret one starts with sk_ or rk_')
} else {
    const balance = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${stripeKey}` }
    })

    check(balance.ok, 'Stripe accepts the secret key', `Stripe rejects STRIPE_SECRET_KEY (${balance.status})`)

    // A test key deployed to production takes no money and looks like a working checkout.
    if (balance.ok && stripeKey.includes('_test_')) {
        fail('STRIPE_SECRET_KEY is a test key — live payments will silently collect nothing')
    }
}

// The sitekey is public and belongs in the client; the secret must never be in the repo.
console.log('\nsecrets')
const secret = process.env.TURNSTILE_SECRET_KEY
const brevoKey = process.env.BREVO_API_KEY

if (!secret) {
    skip('TURNSTILE_SECRET_KEY not in env — export it to check it against Cloudflare')
} else if (secret.startsWith('0x4AAAAAAA') && secret.length < 20) {
    fail('TURNSTILE_SECRET_KEY looks like a sitekey, not a secret key')
} else {
    const body = new FormData()
    body.append('secret', secret)
    body.append('response', 'preflight-dummy-token')

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const codes = (await res.json())['error-codes'] ?? []

    check(
        !codes.includes('invalid-input-secret'),
        'Turnstile secret is accepted by Cloudflare (dummy token correctly refused)',
        'Cloudflare rejects TURNSTILE_SECRET_KEY as invalid'
    )
}

if (!brevoKey) {
    skip('BREVO_API_KEY not in env — export it to check the list and template')
} else {
    const brevo = (path) =>
        fetch(`https://api.brevo.com/v3${path}`, { headers: { accept: 'application/json', 'api-key': brevoKey } })

    const account = await brevo('/account')
    if (!account.ok) {
        fail(`Brevo rejects BREVO_API_KEY (${account.status})`)
    } else {
        pass('Brevo API key is valid')

        const listId = readVar('BREVO_LIST_ID')
        const templateId = readVar('BREVO_OPTIN_TEMPLATE_ID')

        if (listId) {
            const list = await brevo(`/contacts/lists/${listId}`)
            check(list.ok, `Brevo list ${listId} exists`, `Brevo list ${listId} not found (${list.status})`)
        }

        if (templateId) {
            const tpl = await brevo(`/smtp/templates/${templateId}`)
            check(tpl.ok, `Brevo template ${templateId} exists`, `Brevo template ${templateId} not found (${tpl.status})`)
        }

        const attrs = await brevo('/contacts/attributes')
        if (attrs.ok) {
            const names = (await attrs.json()).attributes.map((a) => a.name)
            for (const needed of ['CONSENT_TEXT', 'CONSENT_VERSION', 'CONSENT_URL', 'CONSENT_AT', 'LOCALE']) {
                check(names.includes(needed), `attribute ${needed}`, `Brevo contact attribute ${needed} is missing`)
            }
        }
    }
}

console.log(failed ? `\n${failed} check(s) failed — do not deploy yet.\n` : '\nAll preflight checks passed.\n')
process.exit(failed ? 1 : 0)
