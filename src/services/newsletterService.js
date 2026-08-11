import { useFormSubmit } from '@/composables/useFormSubmit'

// Brevo owns the list and the consent proof: its double opt-in records the confirmation
// timestamp and IP, which is stronger evidence than a log written before confirmation.
export function useNewsletter() {
    const { status, captcha, submit } = useFormSubmit('/newsletter')

    return {
        status,
        captcha,
        subscribe: ({ email, locale, consentText }) => submit({ email, locale, consentText })
    }
}
