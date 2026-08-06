<script setup>
    import { useI18n } from 'vue-i18n'
    import { RouterLink } from 'vue-router'
    import { reopenAnalyticsConsent } from '@/services/analytics'

    const { t } = useI18n()
</script>

<template>
    <footer class="footer">
        <div class="footer-content card-grid">
            <!-- Contact Column -->
            <div class="footer-column u-text">
                <h3>{{ t('footer.contact.title') }}</h3>
                <ul>
                    <li>
                        <a href="tel:+40123456789">{{ t('footer.contact.phone') }}</a>
                    </li>
                    <li>
                        <a href="mailto:andreea.ardei@gmail.com">
                            {{ t('footer.contact.email') }}
                        </a>
                    </li>
                    <li>
                        <a href="https://facebook.com/" target="_blank">
                            {{ t('footer.contact.facebook') }}
                        </a>
                    </li>
                    <li>
                        <a href="https://instagram.com/" target="_blank">
                            {{ t('footer.contact.instagram') }}
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Schedule Column -->
            <div class="footer-column">
                <h3>{{ t('footer.schedule.title') }}</h3>
                <p>{{ t('footer.schedule.hours') }}</p>
            </div>

            <!-- Information Column -->
            <div class="footer-column">
                <h3>{{ t('footer.info.title') }}</h3>
                <ul>
                    <li>
                        <RouterLink to="/termeni">{{ t('footer.info.terms') }}</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>
                    </li>
                    <li>
                        <button class="footer-link" @click="reopenAnalyticsConsent">
                            {{ t('footer.info.analytics') }}
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
    .footer {
        border-top: 1px solid rgb(from var(--vt-c-jannafer-green) r g b / 20%);
        padding: clamp(2rem, 1rem + 3vw, 4rem) var(--page-gutter);
        margin-top: auto;
    }

    .footer-content {
        --card-min: 11rem;
        --card-grid-gap: var(--vt-c-split-gap);
        max-width: var(--vt-c-container-width);
        margin: 0 auto;
    }

    .footer-column {
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        li {
            margin-bottom: 0.75rem;
        }

        p {
            color: rgb(from var(--vt-c-black) r g b / 65%);
        }
    }

    // strips the global button chrome so it reads as the link its siblings are
    .footer-link {
        padding: 0;
        background: none;
        font-size: inherit;
        color: var(--vt-c-jannafer-green);

        &:hover {
            background: none;
            color: var(--vt-c-jannafer-green);
            text-decoration: underline;
        }
    }

</style>