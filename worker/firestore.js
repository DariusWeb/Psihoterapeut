// Firestore over REST, because the Google SDKs do not run on Workers. Written only from here —
// the browser never gets a handle, and firestore.rules stays sealed since a service account
// bypasses rules entirely.

import { accessToken } from './google-auth.js'

const SCOPE = 'https://www.googleapis.com/auth/datastore'

// Firestore tags every value with its type; Date and nested objects are the two that bite.
function toValue(value) {
    if (value === null || value === undefined) return { nullValue: null }
    if (typeof value === 'boolean') return { booleanValue: value }
    if (typeof value === 'number') return { integerValue: String(value) }
    if (value instanceof Date) return { timestampValue: value.toISOString() }
    if (typeof value === 'object') return { mapValue: { fields: toFields(value) } }
    return { stringValue: String(value) }
}

const toFields = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toValue(value)]))

async function documents(env, path, options = {}) {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
    const token = await accessToken(serviceAccount, SCOPE)

    return fetch(
        `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/${path}`,
        {
            ...options,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        }
    )
}

export async function writeDoc(env, collection, docId, data) {
    const response = await documents(env, `${collection}?documentId=${encodeURIComponent(docId)}`, {
        method: 'POST',
        body: JSON.stringify({ fields: toFields(data) })
    })

    if (!response.ok) throw new Error(`Firestore write failed: ${response.status} ${await response.text()}`)
}

// PATCH creates the document when it is missing, so a lost write earlier in the flow still
// leaves a complete record rather than an update with nowhere to land.
export async function patchDoc(env, collection, docId, data) {
    const mask = Object.keys(data)
        .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
        .join('&')

    const response = await documents(env, `${collection}/${encodeURIComponent(docId)}?${mask}`, {
        method: 'PATCH',
        body: JSON.stringify({ fields: toFields(data) })
    })

    if (!response.ok) throw new Error(`Firestore patch failed: ${response.status} ${await response.text()}`)
}

// Null for a document that does not exist — a missing record is an answer, not a failure.
export async function readDoc(env, collection, docId) {
    const response = await documents(env, `${collection}/${encodeURIComponent(docId)}`)

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Firestore read failed: ${response.status} ${await response.text()}`)

    return response.json()
}

// Brevo hides double-opt-in signups until they confirm, so an independent log is the only way
// to see who subscribed and never clicked through.
export function logSignup(env, { email, locale, source, consentText, consentVersion, pageUrl }) {
    return writeDoc(env, 'newsletterConsent', crypto.randomUUID(), {
        email,
        locale,
        source,
        consentText,
        consentVersion,
        pageUrl,
        // Brevo owns the confirmation itself; this only records that the form was submitted.
        confirmed: false,
        createdAt: new Date()
    })
}
