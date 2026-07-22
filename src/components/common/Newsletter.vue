<script setup>
    import { ref } from 'vue'
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()
    const email = ref('')
    const consent = ref(false)

    const handleSubmit = () => {
        if (email.value && consent.value) {
            email.value = ''
            consent.value = false
        }
    }
</script>

<template>
    <div class="newsletter layout-full">
        <div class="newsletter-outer">
            <h2>{{ t('newsletter.title') }}</h2>
            <p>{{ t('newsletter.description') }}</p>

            <form @submit.prevent="handleSubmit" class="newsletter-form">
                <div class="newsletter-fields">
                    <input v-model="email" type="email" :placeholder="t('newsletter.emailPlaceholder')"
                        :aria-label="t('newsletter.emailPlaceholder')" required>

                    <button type="submit">
                        {{ t('button.subscribe') }}
                    </button>
                </div>

                <div class="newsletter-consent">
                    <input id="newsletter-consent" v-model="consent" type="checkbox" required>
                    <label for="newsletter-consent">
                        {{ t('newsletter.consent') }}
                        <RouterLink to="/privacy">{{ t('footer.info.privacy') }}</RouterLink>
                    </label>
                </div>
            </form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .newsletter {
        padding: 5rem;
        background: var(--vt-c-jannafer-gray);
    }

    .newsletter-outer {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: 0 auto;

        .newsletter-form {
            background: transparent;
            margin-top: 1.5rem;
        }

        .newsletter-fields {
            display: flex;
            gap: 1rem;
        }

        input[type="email"] {
            width: 100%;
        }

        .newsletter-consent {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.75rem;
            font-size: 0.9rem;

            label {
                cursor: pointer;
            }
        }
    }
</style>