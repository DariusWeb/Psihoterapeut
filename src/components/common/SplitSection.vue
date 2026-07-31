<script setup>
    import { Image } from '@lucide/vue'

    defineProps({
        image: String,
        alt: String,
        flush: Boolean,
        priority: Boolean
    })
</script>

<template>
    <section class="split-section" :class="{ 'split-flush': flush }">
        <div class="split-media">
            <img v-if="image" class="split-image" :src="image" :alt="alt" width="1221" height="814"
                decoding="async" :loading="priority ? 'eager' : 'lazy'"
                :fetchpriority="priority ? 'high' : null" />
            <div v-else class="media-placeholder" role="img" :aria-label="alt">
                <Image :size="40" />
            </div>
        </div>

        <div class="split-body">
            <slot />
        </div>
    </section>
</template>

<style scoped lang="scss">
    .split-image {
        width: 100%;
        height: 100%;
        min-height: 24rem;
        object-fit: cover;
        border-radius: 1rem;
    }

    .split-flush .split-image,
    .split-flush :deep(.media-placeholder) {
        border-radius: 0 1rem 1rem 0;
    }

    @media (max-width: 1024px) {
        .split-flush .split-image,
        .split-flush :deep(.media-placeholder) {
            border-radius: 1rem;
        }

        .split-image {
            min-height: 18rem;
        }
    }
</style>
