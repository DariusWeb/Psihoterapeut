<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()

    defineProps({
        id: Number,
        title: String,
        details: String,
        image: String,
    })
</script>

<template>
    <div class="event-card">
        <div class="event-image">
            <img v-if="image" :src="image" :alt="title">
        </div>

        <div class="event-details">
            <h3>{{ title }}</h3>
            <p>{{ details }}</p>

            <RouterLink :to="`/events/${id}`" class="event-link">
                {{ t('button.findOutMore') }}
            </RouterLink>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .event-card {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .event-image {
            height: 200px;
            background: var(--vt-c-surface-strong);

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
