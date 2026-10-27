<script setup>
    import { computed } from 'vue'
    import { RouterLink, useRoute } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { BadgeCheck, ChevronRight } from '@lucide/vue'
    import { useServicesStore } from '@/stores/servicesStore'
    import CtaBand from '@/components/common/CtaBand.vue'

    const route = useRoute()
    const servicesStore = useServicesStore()
    const { t, tm, rt } = useI18n()

    // One route per service, generated from the same array the store reads, so this always resolves.
    const service = computed(() => servicesStore.getServiceBySlug(route.meta.slug))

    const base = computed(() => `services.${service.value.key}`)

    // tm() returns the raw array so a shared component can render lists of any length
    const messages = (sectionKey, field) => {
        const list = tm(`${base.value}.${sectionKey}`)?.[field]
        return Array.isArray(list) ? list.map(rt) : []
    }
    const listItems = (sectionKey) => messages(sectionKey, 'items')

    // Splits each item around its emphasis phrase so the phrase renders bold without v-html
    const gridItems = (sectionKey) => {
        const phrases = messages(sectionKey, 'emphasis')
        return listItems(sectionKey).map((item, index) => {
            const phrase = phrases[index] ?? ''
            const at = phrase ? item.indexOf(phrase) : -1
            if (at < 0) return { before: item, phrase: '', after: '' }
            return { before: item.slice(0, at), phrase, after: item.slice(at + phrase.length) }
        })
    }

    // Sections carry different optional paragraphs; probing the tree keeps t() from warning on absent ones
    const text = (sectionKey, field) => {
        const section = tm(`${base.value}.${sectionKey}`)
        return section?.[field] ? t(`${base.value}.${sectionKey}.${field}`) : ''
    }
</script>

<template>
    <main class="bands">
        <section class="hero-grid">
            <div class="hero-grid-text statement">
                <nav class="breadcrumb" :aria-label="t('navigation.breadcrumb')">
                    <RouterLink to="/servicii">{{ t('navigation.menu.services') }}</RouterLink>
                    <ChevronRight :size="14" aria-hidden="true" />
                    <span aria-current="page">{{ t(`${base}.title`) }}</span>
                </nav>
                <h1 class="statement-title">{{ t(`${base}.hero.title`) }}</h1>
                <p class="text-lead service-lead text-pretty">{{ t(`${base}.hero.p1`) }}</p>
                <p class="service-text text-pretty">{{ t(`${base}.hero.p2`) }}</p>
                <p class="service-text text-pretty">{{ t(`${base}.hero.closing`) }}</p>
                <div class="actions">
                    <RouterLink class="button-primary" to="/programare">{{ t('cta.button') }}</RouterLink>
                    <RouterLink class="button-outline" :to="{ hash: '#terapia' }">
                        {{ t('services.index.therapyLink') }}
                    </RouterLink>
                </div>
            </div>
            <img class="hero-grid-media service-photo" :src="service.image" :alt="t(`${base}.imageAlt`)"
                width="1221" height="814" decoding="async" loading="eager" fetchpriority="high" />
        </section>

        <section v-for="section in service.sections" :key="section.key"
            :id="section.type === 'split' ? 'terapia' : null"
            :class="section.type === 'split' ? 'hero-grid hero-grid-mirrored service-split' : 'band'">
            <template v-if="section.type === 'grid'">
                <div class="service-grid-head">
                    <h2 class="section-title">{{ t(`${base}.${section.key}.title`) }}</h2>
                    <p v-if="text(section.key, 'intro')" class="text-pretty">{{ text(section.key, 'intro') }}</p>
                </div>
                <ul v-reveal class="service-grid"
                    :style="{ '--service-grid-rows': Math.ceil(listItems(section.key).length / 2) }">
                    <li v-for="(item, index) in gridItems(section.key)" :key="index" class="service-grid-item">
                        <component :is="section.icons[index]" :size="22" aria-hidden="true" />
                        <p class="text-pretty">{{ item.before }}<b v-if="item.phrase">{{ item.phrase }}</b>{{ item.after }}</p>
                    </li>
                </ul>
                <p v-if="text(section.key, 'closing')" class="service-text text-pretty">{{ text(section.key, 'closing') }}</p>
            </template>

            <template v-else>
                <div class="hero-grid-text">
                    <h2 class="section-title">{{ t(`${base}.${section.key}.title`) }}</h2>
                    <p v-if="text(section.key, 'intro')" class="text-pretty">{{ text(section.key, 'intro') }}</p>
                    <ul v-if="listItems(section.key).length" class="icon-list">
                        <li v-for="item in listItems(section.key)" :key="item" class="icon-list-item">
                            <BadgeCheck :size="17" aria-hidden="true" />{{ item }}
                        </li>
                    </ul>
                    <p v-if="text(section.key, 'body')" class="text-pretty">{{ text(section.key, 'body') }}</p>
                    <p v-if="text(section.key, 'closing')" class="service-split-closing text-pretty">
                        {{ text(section.key, 'closing') }}
                    </p>
                </div>
                <img class="hero-grid-media service-photo" :src="section.image"
                    :alt="t(`${base}.${section.key}.imageAlt`)" width="1221" height="814" decoding="async"
                    loading="lazy" />
            </template>
        </section>

        <CtaBand :title="t(`${base}.cta.title`)" :text="t(`${base}.cta.text`)" with-message-link />
    </main>
</template>

<style scoped lang="scss">
    .service-lead {
        max-width: 46ch;
    }

    .service-text {
        max-width: 52ch;
    }

    .service-photo {
        border-radius: 0;
    }

    .service-split .hero-grid-text {
        padding-left: var(--s-56);
    }

    .service-split-closing {
        margin-top: var(--s-4);
    }

    .service-grid-head {
        display: flex;
        flex-direction: column;
        gap: var(--s-12);
    }

    // Column-first flow so the list reads down the left column, then the right
    .service-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: repeat(var(--service-grid-rows), auto);
        grid-auto-flow: column;
        gap: var(--s-28) var(--s-64);
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .service-grid-item {
        display: grid;
        grid-template-columns: 22px minmax(0, 1fr);
        gap: var(--s-14);
        align-items: start;
        line-height: 1.6;
        color: var(--ink-muted);

        > svg {
            margin-top: calc((1lh - 22px) / 2);
            color: var(--olive-600);
        }

        b {
            font-weight: 600;
            color: var(--olive-800);
        }
    }

    @media (max-width: 767px) {
        .service-split .hero-grid-text {
            padding-left: var(--gutter);
        }

        .service-grid {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: none;
            grid-auto-flow: row;
            gap: var(--s-20);
        }
    }
</style>
