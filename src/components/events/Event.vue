<script setup>
    import { useRoute } from 'vue-router'
    import { computed } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useEventsStore } from '@/stores/eventsStore'
    import NotFound from '@/views/NotFound.vue'

    const route = useRoute()
    const eventsStore = useEventsStore()
    const { locale } = useI18n()

    const event = computed(() =>
        eventsStore.getEventById(Number(route.params.id))
    )

    const formattedDate = computed(() =>
        event.value ? new Date(event.value.date).toLocaleDateString(locale.value) : ''
    )
</script>

<template>
    <main v-if="event" class="event-detail">
        <img v-if="event.image" :src="event.image" :alt="event.title">
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
