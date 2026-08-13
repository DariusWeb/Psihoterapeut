<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { CalendarDays, Heart } from '@lucide/vue'

    const { t } = useI18n()

    defineProps({
        title: String,
        text: String,
        icon: [Object, Function]
    })
</script>

<template>
    <section class="cta-band card">
        <div class="cta-band-content">
            <h2 class="cta-band-title">
                <component :is="icon" v-if="icon" class="cta-band-title-icon" :size="22" />
                {{ title }}
            </h2>
            <p class="cta-band-text">{{ text }}</p>
        </div>

        <div class="cta-band-action">
            <RouterLink class="button button-primary cta-band-button" to="/programare">
                <CalendarDays :size="18" />
                {{ t('cta.button') }}
            </RouterLink>

            <p class="cta-band-note">
                <Heart :size="16" />
                {{ t('cta.note') }}
            </p>
        </div>
    </section>
</template>

<style scoped lang="scss">
    .cta-band-title {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
        margin: 0;
    }

    .cta-band-title-icon {
        flex-shrink: 0;
        color: var(--vt-c-jannafer-green);
    }

    .cta-band-text {
        margin: 0;
        line-height: 1.7;
    }
</style>
