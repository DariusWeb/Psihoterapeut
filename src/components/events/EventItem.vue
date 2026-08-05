<script setup>
    import { computed } from 'vue'
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { CalendarDays, Clock, Image, MapPin, Monitor, Users } from '@lucide/vue'

    const { t, locale } = useI18n()

    const props = defineProps({
        id: Number,
        title: String,
        details: String,
        image: String,
        date: String,
        time: String,
        location: String,
        online: Boolean
    })

    const formattedDate = computed(() =>
        new Date(props.date).toLocaleDateString(locale.value, {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    )
</script>

<template>
    <article class="atelier-card card card-compact card-outlined">
        <div class="atelier-media card-media media-fade">
            <img v-if="image" class="atelier-image" :src="image" :alt="title" width="600" height="400"
                decoding="async" loading="lazy" />
            <div v-else class="media-placeholder atelier-image" role="img" :aria-label="title">
                <Image :size="32" />
            </div>

            <span class="atelier-badge">{{ t('events.upcoming.badge') }}</span>
        </div>

        <p class="meta-row">
            <span class="meta-item">
                <CalendarDays :size="16" />
                <time :datetime="date">{{ formattedDate }}</time>
            </span>
            <span class="meta-item">
                <Clock :size="16" />
                {{ time }}
            </span>
        </p>

        <h3 class="card-title">{{ title }}</h3>
        <p class="atelier-text">{{ details }}</p>

        <p class="meta-row">
            <span class="meta-item">
                <component :is="online ? Monitor : MapPin" :size="16" />
                {{ location }}
            </span>
            <span class="meta-item">
                <Users :size="16" />
                {{ t('events.upcoming.limitedSeats') }}
            </span>
        </p>

        <RouterLink class="button button-primary atelier-cta" :to="`/events/${id}`">
            {{ t('events.upcoming.details') }}
        </RouterLink>
    </article>
</template>

<style scoped lang="scss">
    .atelier-card {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .atelier-media {
        position: relative; // anchors the badge
    }

    .atelier-image {
        width: 100%;
        height: 100%;
        min-height: 0; // .media-placeholder ships a 24rem floor that would blow the card open
        object-fit: cover;
        border-radius: 0; // the wrapper's overflow:hidden already rounds the outer corners
    }

    .atelier-badge {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        padding: 0.25rem 0.75rem;
        border-radius: 2rem;
        background: rgb(from var(--vt-c-jannafer-green) r g b / 0.85);
        color: var(--vt-c-on-accent);
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .atelier-text {
        flex: 1;
        margin: 0;
    }

    .atelier-cta {
        width: 100%;
        text-align: center;
    }
</style>
