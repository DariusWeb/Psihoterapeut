<script setup>
    import { useI18n } from 'vue-i18n'

    const { t, tm } = useI18n()
</script>

<template>
    <section class="events">
        <h1 class="events-title">{{ t('events.title') }}</h1>

        <div class="events-grid">
            <div v-for="(event, index) in tm('events.items')" :key="index" class="event-card">
                <div class="event-image">
                    <img :src="`${event.image}`" :alt="event.title">
                </div>

                <div class="event-details">
                    <h3>{{ event.title }}</h3>
                    <p>{{ event.details }}</p>

                    <RouterLink :to="event.link" class="event-link">
                        {{ t('button.findOutMore') }}
                    </RouterLink>
                </div>
            </div>
        </div>
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
            margin-bottom: 4rem;
        }
    }

    .event-card {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .event-image {
            height: 200px;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .event-details {
            padding: 1.5rem;

            h3 {
                margin-bottom: 1rem;
            }
        }
    }
</style>