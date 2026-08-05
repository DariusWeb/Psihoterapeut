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

        <div class="services-list">
            <RouterLink v-for="service in servicesStore.allServices" :key="service.id"
                class="services-card card card-compact card-link" :to="`/services/${service.slug}`">
                <img class="card-media media-fade" :src="service.image"
                    :alt="t(`services.${service.key}.imageAlt`)" width="1221" height="814" decoding="async"
                    loading="eager" />

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
        margin: -2rem auto 3rem;
        text-align: center;
        line-height: 1.7;
    }

    .services-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
    }

    .services-card {
        --card-media-height: 12rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .services-card-title {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 600;
    }

    .services-card-teaser {
        flex: 1;
        margin: 0;
        line-height: 1.6;
    }

    @media (max-width: 1024px) {
        .services-list {
            grid-template-columns: 1fr;
        }

        .services-intro {
            margin-top: 0;
        }
    }
</style>
