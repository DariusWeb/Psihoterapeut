// The contact form, delivered as a plain email with the visitor set as reply-to, so answering
// is a reply rather than a copy-paste.

import { BREVO_EMAIL, brevo } from '../lib/brevo.js'
import { LIMITS, cleanString, isEmail } from '../lib/validate.js'

export async function handleContact(data, env) {
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
