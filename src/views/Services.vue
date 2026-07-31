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
        <p class="services-intro">{{ t('services.index.intro') }}</p>

        <div class="services-list">
            <RouterLink v-for="service in servicesStore.allServices" :key="service.id" class="service-card-link"
                :to="`/services/${service.slug}`">
                <img class="services-card-media" :src="service.image"
                    :alt="t(`services.${service.key}.imageAlt`)" width="1221" height="814" decoding="async"
                    loading="eager" />

                <h2 class="services-card-title">{{ t(`services.${service.key}.title`) }}</h2>
                <p class="services-card-teaser">{{ t(`services.${service.key}.hero.title`) }}</p>

                <span class="services-card-cta">
                    {{ t('services.index.cta') }}
                    <ArrowRight :size="16" />
                </span>
            </RouterLink>
        </div>
    </main>
</template>

<style lang="scss" scoped>
    .services-intro {
        max-width: 60ch;
        margin: -2rem auto 3rem;
        text-align: center;
        line-height: 1.7;
    }

    .services-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
    }

    .service-card-link {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 1rem;
        background: var(--vt-c-surface);
        color: var(--vt-c-black);
        transition: var(--vt-c-transition-speed);

        &:hover {
            text-decoration: none;
            background: var(--vt-c-surface-strong);

            .services-card-cta {
                svg {
                    transform: translateX(0.25rem);
                }
            }
        }
    }

    .services-card-media {
        height: 12rem;
        width: calc(100% + 3rem);
        margin: -1.5rem -1.5rem 0;
        border-radius: 1rem 1rem 0 0;
        object-fit: cover;
        -webkit-mask-image: linear-gradient(to top, transparent, #000 30%);
        mask-image: linear-gradient(to top, transparent, #000 30%);
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

    .services-card-cta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--vt-c-jannafer-green);

        svg {
            transition: var(--vt-c-transition-speed);
        }
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
