import { ref } from 'vue'
import { getToken } from '@/services/turnstile'

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

// Bump whenever the wording of the consent copy changes, so old records stay attributable
// to the text they were actually given.
export const CONSENT_VERSION = '2026-08-11'

// Worker codes are lowercase snake_case; Turnstile and the network reject with prose, which
// must not reach the user as an i18n key.
function errorCodeOf(error) {
    return /^[a-z_]+$/.test(error?.message ?? '') ? error.message : 'generic'
}

export function useFormSubmit(path, { endpoint = FORM_ENDPOINT, fetchImpl = fetch } = {}) {
    const status = ref('idle')
    const errorCode = ref(null)
    const captcha = ref(null)

    async function submit(fields) {
        status.value = 'submitting'
        errorCode.value = null

        try {
            if (!endpoint) throw new Error('not_configured')

            const turnstileToken = await getToken(captcha.value)

            const response = await fetchImpl(`${endpoint}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...fields,
                    turnstileToken,
                    consentVersion: CONSENT_VERSION,
                    pageUrl: window.location.href.slice(0, 500)
                })
            })

            const payload = await response.json().catch(() => ({}))
            if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'generic')

            status.value = 'success'
            // The payload, not a bare true: checkout needs the Stripe URL back. Still truthy,
            // so the forms that only test for success are unaffected.
            return payload
        } catch (error) {
            status.value = 'error'
            errorCode.value = errorCodeOf(error)
            return false
        }
    }

    function reset() {
        status.value = 'idle'
        errorCode.value = null
    }

    return { status, errorCode, captcha, submit, reset }
}
