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
check(
    origins.every((o) => o.startsWith('https://')),
    `origins are https (${origins.length})`,
    'every ALLOWED_ORIGINS entry must be an https origin, with no trailing slash or path'
)

console.log('\nlive banner')
check(
    /^\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*"[0-9a-f]{8,}"/m.test(toml),
    'KV namespace id is filled',
    'the LIVE kv_namespaces id is empty — run: npx wrangler kv namespace create LIVE --config worker/wrangler.toml'
)

// Guessable here means the whole banner is guessable: it is the only thing between a
// stranger and a message shown to every visitor.
const adminToken = process.env.LIVE_ADMIN_TOKEN
if (!adminToken) {
    skip('LIVE_ADMIN_TOKEN not in env — export it to check its strength')
} else {
    check(adminToken.length >= 20, 'LIVE_ADMIN_TOKEN is long enough', 'LIVE_ADMIN_TOKEN is under 20 characters')
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
