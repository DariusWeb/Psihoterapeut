import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// The form's own wording wins over the shared set for the cases it phrases better.
export function useFormErrorMessage(errorCode, fallbackKey) {
    const { t, te } = useI18n()

    return computed(() => {
        if (!errorCode.value) return ''

        const specific = `${fallbackKey}_${errorCode.value}`
        if (te(specific, 'en')) return t(specific)

        const shared = `forms.errors.${errorCode.value}`
        if (te(shared, 'en')) return t(shared)

        return t(fallbackKey)
    })
}
