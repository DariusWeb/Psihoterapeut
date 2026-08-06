const BREVO_FORM_URL = import.meta.env.VITE_BREVO_FORM_URL
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID

const FIRESTORE_DOCUMENTS = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`

// Bump whenever the wording of `newsletter.consent` changes, so old records stay attributable
// to the text they were actually given.
const CONSENT_VERSION = '2026-08-06'

// Brevo owns the list and the subscription state; Firestore only holds the consent proof,
// so a failed audit write must never report failure to a visitor who did subscribe.
export async function subscribe({ email, locale, consentText }) {
    if (!BREVO_FORM_URL || !FIREBASE_PROJECT_ID) {
        throw new Error('Newsletter is not configured: VITE_BREVO_FORM_URL and VITE_FIREBASE_PROJECT_ID must be set.')
    }

    await submitToBrevo(email)
    await logConsent({ email, locale, consentText }).catch(() => {})
}

// ponytail: Brevo's form endpoint sends no CORS headers, so the response is opaque and success
// is assumed. The double opt-in email is the real confirmation. Upgrade path: proxy it through a server.
async function submitToBrevo(email) {
    const body = new FormData()
    body.append('EMAIL', email)
    body.append('email_address_check', '')

    await fetch(BREVO_FORM_URL, { method: 'POST', mode: 'no-cors', body })
}

async function logConsent({ email, locale, consentText }) {
    const response = await fetch(`${FIRESTORE_DOCUMENTS}/newsletterConsent?documentId=${crypto.randomUUID()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fields: {
                email: { stringValue: email },
                locale: { stringValue: locale },
                source: { stringValue: 'newsletter-form' },
                consentText: { stringValue: consentText },
                consentVersion: { stringValue: CONSENT_VERSION },
                // evidences which form and which disclosure text the visitor was shown
                pageUrl: { stringValue: window.location.href.slice(0, 500) },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        })
    })

    if (!response.ok) {
        throw new Error(`Failed to log newsletter consent: ${response.status} ${response.statusText}`)
    }
}
