<script setup>
    import { ref } from 'vue'
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { Heart, Mail } from '@lucide/vue'

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
    <div class="newsletter section-band">
        <div class="newsletter-card card">
            <div class="newsletter-body">
                <h2 class="newsletter-title">{{ t('newsletter.title') }}</h2>
                <p class="newsletter-description">{{ t('newsletter.description') }}</p>

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
                            <RouterLink to="/privacy">{{ t('footer.info.privacy') }}</RouterLink>.
                        </label>
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
        --section-band-padding-block: 5rem;
        --section-band-background: transparent; // the card inside already carries the tint
    }

    .newsletter-card {
        display: flex;
        align-items: center;
        gap: 3rem;
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
        flex: 0 0 15rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem 1.5rem;
        border-radius: 1rem;
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

    @media (max-width: 1024px) {
        .newsletter {
            --section-band-padding-block: 3rem;
        }

        .newsletter-card {
            flex-direction: column-reverse; // aside above the form, per the stacked mock
            align-items: stretch;
            gap: 2rem;
        }

        .newsletter-aside {
            flex: auto;
        }
    }

    @media (max-width: 768px) {
        .newsletter-fields {
            flex-direction: column;
        }

        .newsletter-fields button {
            width: 100%;
        }
    }
</style>
