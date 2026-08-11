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

const origins = readVar('ALLOWED_ORIGINS').split(',').map((o) => o.trim()).filter(Boolean)
check(
    origins.every((o) => o.startsWith('https://')),
    `origins are https (${origins.length})`,
    'every ALLOWED_ORIGINS entry must be an https origin, with no trailing slash or path'
)

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
