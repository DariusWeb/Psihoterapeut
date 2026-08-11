<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { ArrowRight } from '@lucide/vue'
    import { useServicesStore } from '@/stores/servicesStore'

    const servicesStore = useServicesStore()
    const { t } = useI18n()
</script>

<template>
    <main class="services-page">
        <h1>{{ t('services.index.title') }}</h1>
        <p class="section-intro services-intro">{{ t('services.index.intro') }}</p>

        <div class="services-list card-grid">
            <RouterLink v-for="(service, index) in servicesStore.allServices" :key="service.id"
                class="services-card card card-compact card-link" :to="`/servicii/${service.slug}`">
                <img class="card-media media-fade" :src="service.image"
                    :alt="t(`services.${service.key}.imageAlt`)" width="1221" height="814" decoding="async"
                    :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : null" />

                <h2 class="services-card-title">{{ t(`services.${service.key}.title`) }}</h2>
                <p class="services-card-teaser">{{ t(`services.${service.key}.hero.title`) }}</p>

                <span class="link-arrow">
                    {{ t('services.index.cta') }}
                    <ArrowRight :size="16" />
                </span>
            </RouterLink>
        </div>
    </main>
</template>

<style lang="scss" scoped>
    .services-intro {
        // claws back part of the h1's bottom margin, easing to nothing once that margin is small
        margin-top: calc(-1 * clamp(0rem, -1rem + 3vw, 2rem));
        margin-inline: auto;
        margin-bottom: clamp(1.5rem, 0.75rem + 2.4vw, 3rem);
        text-align: center;
        line-height: 1.7;
    }

    .services-list {
        --card-min: 18rem;
        --card-grid-gap: var(--vt-c-split-gap);
    }

    .services-card {
        --card-media-height: clamp(8rem, 5rem + 6vw, 12rem);
        display: flex;
        flex-direction: column;
        gap: clamp(0.75rem, 0.6rem + 0.6vw, 1rem);
    }

    .services-card-title {
        margin: 0;
        font-size: clamp(1.1rem, 0.95rem + 0.6vw, 1.4rem);
        font-weight: 600;
    }

    .services-card-teaser {
        flex: 1;
        margin: 0;
        line-height: 1.6;
    }
</style>
