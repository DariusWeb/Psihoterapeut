<script setup>
    import { computed } from 'vue'
    import { useRoute, RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { CalendarDays, CircleSmall, Heart, Leaf } from '@lucide/vue'
    import { useServicesStore } from '@/stores/servicesStore'
    import SplitSection from '@/components/common/SplitSection.vue'

    const route = useRoute()
    const servicesStore = useServicesStore()
    const { t, tm, rt } = useI18n()

    const service = computed(() => servicesStore.getServiceBySlug(route.params.slug))

    const base = computed(() => `services.${service.value.key}`)

    // tm() returns the raw array so a shared component can render lists of any length
    const listItems = (sectionKey) => tm(`${base.value}.${sectionKey}.items`).map(rt)

    // Sections carry different optional paragraphs; probing the tree keeps t() from warning on absent ones
    const text = (sectionKey, field) => {
        const section = tm(`${base.value}.${sectionKey}`)
        return section?.[field] ? t(`${base.value}.${sectionKey}.${field}`) : ''
    }
</script>

<template>
    <main v-if="service" class="service-page layout-stack">
        <SplitSection flush priority :image="service.image" :alt="t(`${base}.imageAlt`)">
            <p class="credentials">
                <Leaf class="credentials-icon" :size="28" />
                <span v-for="line in tm('services.credentials')" :key="line">{{ rt(line) }}</span>
            </p>

            <h1 class="service-hero-title">{{ t(`${base}.hero.title`) }}</h1>
            <hr class="service-rule" />

            <p class="service-text">{{ t(`${base}.hero.p1`) }}</p>
            <p class="service-text">{{ t(`${base}.hero.p2`) }}</p>
            <p class="service-hero-closing">{{ t(`${base}.hero.closing`) }}</p>
        </SplitSection>

        <SplitSection v-for="section in service.sections" :key="section.key" :image="section.image"
            :alt="t(`${base}.${section.key}.imageAlt`)">
            <div class="service-card card">
                <h2 class="service-section-title">
                    <Leaf class="service-section-icon" :size="22" />
                    {{ t(`${base}.${section.key}.title`) }}
                </h2>

                <p v-if="text(section.key, 'intro')" class="service-text">
                    {{ text(section.key, 'intro') }}
                </p>

                <p v-if="text(section.key, 'body')" class="service-text">
                    {{ text(section.key, 'body') }}
                </p>

                <ul v-if="section.type === 'grid'" class="icon-grid">
                    <li v-for="(item, index) in listItems(section.key)" :key="item" class="icon-grid-item">
                        <component :is="section.icons[index]" class="icon-grid-icon" :size="22" />
                        {{ item }}
                    </li>
                </ul>

                <ul v-else-if="section.type === 'list'" class="dot-list"
                    :class="{ 'dot-list-columns': listItems(section.key).length >= 8 }">
                    <li v-for="item in listItems(section.key)" :key="item" class="dot-list-item">
                        <CircleSmall class="dot-list-bullet" :size="16" />
                        {{ item }}
                    </li>
                </ul>

                <p v-if="text(section.key, 'closing')" class="service-text">
                    {{ text(section.key, 'closing') }}
                </p>
            </div>
        </SplitSection>

        <section class="cta-band card">
            <div class="cta-band-content">
                <h2 class="service-section-title">
                    <Leaf class="service-section-icon" :size="22" />
                    {{ t(`${base}.cta.title`) }}
                </h2>
                <p class="service-text">{{ t(`${base}.cta.text`) }}</p>
            </div>

            <div class="cta-band-action">
                <RouterLink class="button button-primary cta-band-button" to="/contact">
                    <CalendarDays :size="18" />
                    {{ t('services.cta.button') }}
                </RouterLink>

                <p class="cta-band-note">
                    <Heart :size="16" />
                    {{ t('services.cta.note') }}
                </p>
            </div>
        </section>
    </main>

    <main v-else class="service-page">
        <h1>{{ t('services.index.notFound') }}</h1>
        <RouterLink to="/services">{{ t('services.index.back') }}</RouterLink>
    </main>
</template>

<style scoped lang="scss">
    .service-page {
        --vt-c-section-gap: 1rem;
        --vt-c-split-gap: 1rem;
    }

    .service-section-icon {
        flex-shrink: 0;
        color: var(--vt-c-jannafer-green);
    }

    .service-hero-title {
        margin: 0;
        text-align: left;
    }

    .service-rule {
        width: 4rem;
        margin: 0;
        border: 0;
        border-top: 2px solid var(--vt-c-jannafer-green);
    }

    .service-text {
        margin: 0;
        line-height: 1.7;
    }

    .service-hero-closing {
        margin: 0;
        font-weight: 600;
        color: var(--vt-c-jannafer-green);
    }

    .service-card {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        height: 100%;
        justify-content: center;
        border: 1px solid var(--vt-c-jannafer-gray2);
    }

    .service-section-title {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
        margin: 0;
    }
</style>
