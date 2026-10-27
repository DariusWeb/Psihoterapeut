import { ref } from 'vue'
import { getToken } from '@/services/turnstile'

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

// Bump when the consent wording changes, so old records stay tied to the text they were shown.
export const CONSENT_VERSION = '2026-08-11'

// Worker codes are snake_case; Turnstile and network errors are prose and must not show as an i18n key.
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
            // The payload, not `true`: checkout needs the Stripe URL back.
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
