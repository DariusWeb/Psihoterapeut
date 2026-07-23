<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { useEventsStore } from '@/stores/eventsStore'
    import EventItem from '@/components/events/EventItem.vue'

    const { t } = useI18n()
    const eventsStore = useEventsStore()
</script>

<template>
    <section class="events">
        <h2 class="events-title">{{ t('events.title') }}</h2>

        <div class="events-grid">
            <EventItem v-for="event in eventsStore.homeEvents" :key="event.id" v-bind="event" />
        </div>

        <RouterLink to="/events" class="view-more-events">
            {{ t('button.viewAll') }}
        </RouterLink>
    </section>
</template>

<style scoped lang="scss">
    .events {
        &-title {
            text-align: center;
            margin-bottom: 3rem;
        }

        &-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }
    }

    .view-more-events {
        display: table;
        margin: 0 auto;
    }

    @media (max-width: 1024px) {
        .events-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .events-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
