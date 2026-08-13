// Brevo hides double-opt-in signups until they confirm, so an independent log is the only
// way to see who subscribed and never clicked through. Written here, never from the browser.

import { accessToken } from './google-auth.js'

const SCOPE = 'https://www.googleapis.com/auth/datastore'

export async function logSignup(env, { email, locale, source, consentText, consentVersion, pageUrl }) {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
    const token = await accessToken(serviceAccount, SCOPE)

    const url = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/newsletterConsent?documentId=${crypto.randomUUID()}`

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            fields: {
                email: { stringValue: email },
                locale: { stringValue: locale },
                source: { stringValue: source },
                consentText: { stringValue: consentText },
                consentVersion: { stringValue: consentVersion },
                pageUrl: { stringValue: pageUrl },
                // Brevo owns the confirmation itself; this only records that the form was submitted.
                confirmed: { booleanValue: false },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        })
    })

    if (!response.ok) throw new Error(`Firestore write failed: ${response.status} ${await response.text()}`)
}
