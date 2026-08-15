// The challenge every public form is gated behind, verified server-side — a token the browser
// reports as valid means nothing until Cloudflare says so.

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token, ip, secret) {
    if (!token) return false

    const body = new FormData()
    body.append('secret', secret)
    body.append('response', token)
    if (ip !== 'unknown') body.append('remoteip', ip)

    const response = await fetch(TURNSTILE_VERIFY, { method: 'POST', body })
    if (!response.ok) return false

    return (await response.json()).success === true
}
