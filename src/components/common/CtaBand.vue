<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()

    defineProps({
        title: String,
        text: String,
        withMessageLink: Boolean
    })
</script>

<template>
    <section class="band">
        <div class="statement statement-centered">
            <h2 class="statement-title cta-band-title text-balance">{{ title }}</h2>
            <p class="text-lead cta-band-text text-pretty">{{ text }}</p>
            <div class="actions cta-band-actions">
                <RouterLink class="button-primary" to="/programare">{{ t('cta.button') }}</RouterLink>
                <RouterLink v-if="withMessageLink" class="button-outline" to="/contact">
                    {{ t('booking.hero.alternativeLink') }}
                </RouterLink>
            </div>
            <p class="heart-line">{{ t('cta.note') }}</p>
        </div>
    </section>
</template>

<style scoped lang="scss">
    .cta-band-title {
        max-width: 24ch;
        font-size: var(--fs-h1);
        line-height: var(--lh-h1);
        letter-spacing: -0.01em;
    }

    .cta-band-text {
        max-width: 56ch;
    }

    .cta-band-actions {
        margin-top: var(--s-4);
    }
</style>
