<script setup>
    import { computed, ref } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { ArrowRight, Image, Leaf, Monitor, Repeat } from '@lucide/vue'
    import { useEventsStore } from '@/stores/eventsStore'
    import { groups } from '@/content/groups'
    import EventItem from '@/components/events/EventItem.vue'
    import Newsletter from '@/components/common/Newsletter.vue'
    import CtaBand from '@/components/common/CtaBand.vue'

    const { t } = useI18n()
    const eventsStore = useEventsStore()

    const previewCount = 3
    const showAllEvents = ref(false)
    const showAllGroups = ref(false)

    const visibleEvents = computed(() =>
        showAllEvents.value ? eventsStore.upcomingEvents : eventsStore.upcomingEvents.slice(0, previewCount)
    )

    const visibleGroups = computed(() =>
        showAllGroups.value ? groups : groups.slice(0, previewCount)
    )
</script>

<template>
    <main class="events-page layout-stack">
        <section class="page-hero">
            <div class="page-hero-content">
                <h1 class="page-hero-title">{{ t('events.hero.title') }}</h1>
                <Leaf class="section-flourish" :size="28" />
                <p class="page-hero-intro">{{ t('events.hero.intro') }}</p>
            </div>

            <div class="page-hero-media media-placeholder media-fade bleed-right" role="img"
                :aria-label="t('events.hero.imageAlt')">
                <Image :size="40" />
            </div>
        </section>

        <section class="stack">
            <div class="section-head">
                <h2>{{ t('events.upcoming.title') }}</h2>

                <button v-if="eventsStore.upcomingEvents.length > previewCount" type="button" class="link-arrow"
                    @click="showAllEvents = !showAllEvents">
                    {{ showAllEvents ? t('events.upcoming.viewLess') : t('events.upcoming.viewAll') }}
                    <ArrowRight :size="16" />
                </button>
            </div>

            <p class="section-intro">{{ t('events.upcoming.intro') }}</p>

            <div class="card-grid">
                <EventItem v-for="event in visibleEvents" :key="event.id" v-bind="event" />
            </div>
        </section>

        <section id="grupuri" class="stack">
            <div class="section-head">
                <h2>{{ t('events.groups.title') }}</h2>

                <button v-if="groups.length > previewCount" type="button" class="link-arrow"
                    @click="showAllGroups = !showAllGroups">
                    {{ showAllGroups ? t('events.groups.viewLess') : t('events.groups.viewAll') }}
                    <ArrowRight :size="16" />
                </button>
            </div>

            <p class="section-intro">{{ t('events.groups.intro') }}</p>

            <div class="card-grid">
                <article v-for="group in visibleGroups" :key="group.key" class="group-card card card-compact card-outlined">
                    <span class="icon-chip">
                        <component :is="group.icon" :size="22" />
                    </span>

                    <div class="group-body">
                        <h3 class="card-title">{{ t(`events.groups.${group.key}.title`) }}</h3>
                        <p class="group-text">{{ t(`events.groups.${group.key}.text`) }}</p>

                        <p class="meta-row">
                            <span class="meta-item">
                                <Monitor :size="16" />
                                {{ t(`events.groups.${group.key}.location`) }}
                            </span>
                            <span class="meta-item">
                                <Repeat :size="16" />
                                {{ t(`events.groups.${group.key}.frequency`) }}
                            </span>
                        </p>
                    </div>
                </article>
            </div>
        </section>

        <Newsletter />

        <CtaBand :title="t('events.cta.title')" :text="t('events.cta.text')" />
    </main>
</template>

<style scoped lang="scss">
    .events-page {
        --page-pad-top: 0; // the hero media runs flush to the top, behind the fixed nav
    }

    .group-card {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .group-body {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .group-text {
        flex: 1;
        margin: 0;
    }
</style>
