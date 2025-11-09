<script setup>
    import { useI18n } from 'vue-i18n'
    import { RouterLink } from 'vue-router'

    const { t } = useI18n()
</script>

<template>
    <footer class="footer">
        <div class="footer-content">
            <!-- Contact Column -->
            <div class="footer-column">
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
                        <RouterLink to="/cookies">{{ t('footer.info.terms') }}</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/privacy">{{ t('footer.info.privacy') }}</RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
    .footer {
        border-top: 1px solid rgb(from var(--vt-c-jannafer-green) r g b / 20%);
        padding: 4rem 2rem;
        margin-top: auto;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
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
            color: var(--color-text-light);
        }
    }
</style>