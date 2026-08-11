import { ref } from 'vue'
import { getToken } from '@/services/turnstile'

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

// Bump whenever the wording of the consent copy changes, so old records stay attributable
// to the text they were actually given.
export const CONSENT_VERSION = '2026-08-11'

export function useFormSubmit(path) {
    const status = ref('idle')
    const captcha = ref(null)

    async function submit(fields) {
        if (!FORM_ENDPOINT) throw new Error('Forms are not configured: VITE_FORM_ENDPOINT must be set.')

        status.value = 'submitting'

        try {
            const turnstileToken = await getToken(captcha.value)

            const response = await fetch(`${FORM_ENDPOINT}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...fields,
                    turnstileToken,
                    consentVersion: CONSENT_VERSION,
                    pageUrl: window.location.href.slice(0, 500)
                })
            })

            if (!response.ok || !(await response.json()).ok) throw new Error(`Submit failed: ${response.status}`)

            status.value = 'success'
            return true
        } catch {
            status.value = 'error'
            return false
        }
    }

    return { status, captcha, submit }
}
