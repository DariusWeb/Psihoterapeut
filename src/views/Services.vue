<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { ArrowRight } from '@lucide/vue'
    import { useServicesStore } from '@/stores/servicesStore'
    import CtaBand from '@/components/common/CtaBand.vue'

    const servicesStore = useServicesStore()
    const { t } = useI18n()
</script>

<template>
    <main class="bands">
        <section class="band services-areas">
            <div class="statement statement-centered">
                <h1 class="statement-title">{{ t('services.index.title') }}</h1>
                <p class="text-lead services-lead text-pretty">{{ t('services.index.lead') }}</p>
                <p class="services-text text-pretty">{{ t('services.index.text') }}</p>
            </div>

            <div v-reveal:cards class="grid-3">
                <RouterLink v-for="(service, index) in servicesStore.allServices" :key="service.id"
                    class="paper-card paper-card-link" :to="`/servicii/${service.slug}`">
                    <img class="paper-card-media" :src="service.image" :alt="t(`services.${service.key}.imageAlt`)"
                        width="1221" height="814" decoding="async" :loading="index === 0 ? 'eager' : 'lazy'"
                        :fetchpriority="index === 0 ? 'high' : null" />
                    <div class="paper-card-body">
                        <h2 class="paper-card-title services-card-title">{{ t(`services.${service.key}.title`) }}</h2>
                        <p class="paper-card-text text-pretty">{{ t(`services.${service.key}.hero.title`) }}</p>
                        <div class="paper-card-footer">
                            <span class="card-action">
                                {{ t('services.index.cta') }}<span class="card-action-icon"><ArrowRight :size="17" /></span>
                            </span>
                        </div>
                    </div>
                </RouterLink>
            </div>
        </section>

        <CtaBand :title="t('services.index.closingTitle')" :text="t('services.index.closingText')" with-message-link />
    </main>
</template>

<style lang="scss" scoped>
    .services-areas {
        --card-media-h: 220px;
        gap: var(--s-48);
    }

    .services-lead {
        max-width: 46ch;
    }

    .services-text {
        max-width: 52ch;
    }

    .services-card-title {
        font-size: var(--fs-h3);
        line-height: var(--lh-h3);
    }

    @media (max-width: 767px) {
        .services-areas {
            --card-media-h: 180px;
            gap: var(--head-gap);
        }

        .services-areas .grid-3 {
            grid-template-columns: 1fr;
        }
    }
</style>
