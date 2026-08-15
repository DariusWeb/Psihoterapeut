// Every Brevo call goes through here. The browser never talks to Brevo directly: its form
// hosts are on EasyPrivacy, so ad blockers were silently killing signups.

export const BREVO_CONTACTS = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
export const BREVO_EMAIL = 'https://api.brevo.com/v3/smtp/email'

export async function brevo(url, apiKey, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json', 'api-key': apiKey },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        throw new Error(`Brevo ${response.status}: ${await response.text()}`)
    }
}
