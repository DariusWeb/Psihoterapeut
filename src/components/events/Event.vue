<script setup>
    import { useRoute } from 'vue-router'
    import { computed, watchEffect, onUnmounted } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useEventsStore } from '@/stores/eventsStore'
    import { applySeo, applyJsonLd } from '@/utils/seo'
    import { SITE, absoluteUrl } from '@/seo.config'
    import NotFound from '@/views/NotFound.vue'

    const route = useRoute()
    const eventsStore = useEventsStore()
    const { t, locale } = useI18n()

    const event = computed(() =>
        eventsStore.getEventBySlug(route.params.slug)
    )

    const formattedDate = computed(() =>
        event.value
            ? new Date(event.value.date).toLocaleDateString(locale.value, {
                day: 'numeric', month: 'long', year: 'numeric'
            })
            : ''
    )

    watchEffect(() => {
        if (!event.value) {
            // Without this an unknown slug would serve the list page's title as a soft 404.
            applySeo({ title: t('seo.notFound.title'), description: t('seo.notFound.description'), path: route.path })
            applyJsonLd('event', null)
            return
        }

        applySeo({
            title: event.value.title,
            description: event.value.details,
            path: route.path,
            image: event.value.image
        })

        applyJsonLd('event', {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.value.title,
            description: event.value.details,
            startDate: event.value.date,
            inLanguage: SITE.lang,
            url: absoluteUrl(route.path),
            eventAttendanceMode: event.value.online
                ? 'https://schema.org/OnlineEventAttendanceMode'
                : 'https://schema.org/OfflineEventAttendanceMode',
            location: event.value.online
                ? { '@type': 'VirtualLocation', url: absoluteUrl(route.path) }
                : { '@type': 'Place', name: event.value.location },
            organizer: { '@type': 'Person', name: SITE.name }
        })
    })

    onUnmounted(() => applyJsonLd('event', null))
</script>

<template>
    <main v-if="event" class="event-detail">
        <img v-if="event.image" :src="event.image" :alt="event.imageAlt ?? event.title" width="800" height="450"
            decoding="async" loading="eager" fetchpriority="high">
        <h1>{{ event.title }}</h1>

        <p class="event-meta">
            <time :datetime="event.date">{{ formattedDate }}</time>
            <span v-if="event.location"> · {{ event.location }}</span>
        </p>

        <component :is="event.component" />
    </main>

    <NotFound v-else />
</template>

<style scoped lang="scss">
    .event-detail {
        max-width: 800px;
        margin: 0 auto;

        img {
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 8px;
        }

        .event-meta {
            color: rgb(from var(--vt-c-black) r g b / 65%);
            margin-bottom: 2rem;
        }
    }
</style>
