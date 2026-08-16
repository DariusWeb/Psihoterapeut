import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Resolves a Worker error code to copy, preferring the form's own wording for the cases it
// already phrases better than the shared set (a taken booking slot, a failed payment start).
export function useFormErrorMessage(errorCode, fallbackKey) {
    const { t, te } = useI18n()

    return computed(() => {
        if (!errorCode.value) return ''

        const specific = `${fallbackKey}_${errorCode.value}`
        if (te(specific)) return t(specific)

        const shared = `forms.errors.${errorCode.value}`
        if (te(shared)) return t(shared)

        return t(fallbackKey)
    })
}
