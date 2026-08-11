<script setup>
    import { ref } from 'vue'
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { Heart, Mail } from '@lucide/vue'
    import { useNewsletter } from '@/services/newsletterService'
    import { captureEvent } from '@/services/analytics'

    const { t, locale } = useI18n()
    const email = ref('')
    const consent = ref(false)
    const { status, captcha, subscribe } = useNewsletter()

    const handleSubmit = async () => {
        const sent = await subscribe({
            email: email.value,
            locale: locale.value,
            // the exact wording the visitor agreed to, stored as the consent proof
            consentText: `${t('newsletter.consent')} ${t('footer.info.privacy')}.`
        })

        if (!sent) return

        // no address — an analytics copy would be personal data with no basis to hold it
        captureEvent('newsletter_subscribed')

        email.value = ''
        consent.value = false
    }
</script>

<template>
    <div class="newsletter section-band">
        <div class="newsletter-card card">
            <div class="newsletter-body">
                <h2 class="newsletter-title">{{ t('newsletter.title') }}</h2>
                <p class="newsletter-description">{{ t('newsletter.description') }}</p>

                <form @submit.prevent="handleSubmit" class="newsletter-form">
                    <div class="newsletter-fields">
                        <input v-model="email" type="email" :placeholder="t('newsletter.emailPlaceholder')"
                            :aria-label="t('newsletter.emailPlaceholder')" required>

                        <button type="submit" :disabled="status === 'submitting'">
                            {{ t('button.subscribe') }}
                        </button>
                    </div>

                    <div class="newsletter-consent">
                        <input id="newsletter-consent" v-model="consent" type="checkbox" required>
                        <label for="newsletter-consent">
                            {{ t('newsletter.consent') }}
                            <RouterLink to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>.
                        </label>
                    </div>

                    <div ref="captcha" class="newsletter-captcha"></div>

                    <div v-if="status === 'success'" class="success" role="status">
                        {{ t('newsletter.success') }}
                    </div>

                    <div v-if="status === 'error'" class="error" role="alert">
                        {{ t('newsletter.error') }}
                    </div>
                </form>
            </div>

            <aside class="newsletter-aside">
                <span class="newsletter-mark">
                    <Mail :size="40" />
                    <Heart class="newsletter-mark-heart" :size="18" />
                </span>

                <p class="newsletter-aside-text">{{ t('newsletter.aside') }}</p>
            </aside>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .newsletter {
        --section-band-padding-block: clamp(2rem, 0.75rem + 4vw, 5rem);
        --section-band-background: transparent; // the card inside already carries the tint
    }

    .newsletter-card {
        display: flex;
        align-items: center;
        gap: clamp(1.5rem, 0.75rem + 2.4vw, 3rem);
    }

    .newsletter-body {
        flex: 1;
    }

    .newsletter-title {
        margin: 0 0 0.5rem;
    }

    .newsletter-description {
        margin: 0;
    }

    .newsletter-form {
        padding: 0;
        background: transparent;
        margin-top: 1.5rem;
    }

    .newsletter-fields {
        display: flex;
        gap: 1rem;

        input[type="email"] {
            width: 100%;
        }
    }

    // empty until a challenge actually renders, so it must not reserve space
    .newsletter-captcha:not(:empty) {
        margin-top: 0.75rem;
    }

    .newsletter-consent {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        margin-top: 0.75rem;
        font-size: 0.9rem;

        label {
            cursor: pointer;
        }
    }

    .newsletter-aside {
        flex: 0 0 clamp(11rem, 6rem + 8vw, 15rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: var(--card-padding-compact);
        border-radius: var(--vt-c-radius-lg);
        background: var(--vt-c-background);
        text-align: center;
    }

    // the heart overlaps the envelope's lower-right corner so the pair reads as a single mark
    .newsletter-mark {
        position: relative;
        display: inline-flex;
        color: var(--vt-c-jannafer-green);
    }

    .newsletter-mark-heart {
        position: absolute;
        right: -5px;
        bottom: 0;
        fill: var(--vt-c-background);
    }

    .newsletter-aside-text {
        margin: 0;
        font-size: 0.9rem;
    }

    @media (max-width: 768px) {
        .newsletter-card {
            flex-direction: column-reverse; // aside above the form, per the stacked mock
            align-items: stretch;
        }

        .newsletter-aside {
            flex: auto;
        }

        .newsletter-fields {
            flex-direction: column;
        }

        .newsletter-fields button {
            width: 100%;
        }
    }
</style>
