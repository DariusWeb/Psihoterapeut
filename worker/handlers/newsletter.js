// Brevo sends the opt-in email and only creates the contact once it is confirmed, so the
// confirmation timestamp and IP it records are the consent proof — nothing is stored here.

import { BREVO_CONTACTS, brevo } from '../lib/brevo.js'
import { logSignup } from '../lib/firestore.js'
import { LIMITS, cleanString, isEmail } from '../lib/validate.js'

export async function handleNewsletter(data, env) {
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
