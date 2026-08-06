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
        min-height: var(--vt-c-media-min-height);
        object-fit: cover;
        border-radius: var(--vt-c-radius-lg);
    }

    .split-flush .split-image,
    .split-flush :deep(.media-placeholder) {
        border-radius: 0 var(--vt-c-radius-lg) var(--vt-c-radius-lg) 0;
    }

    // stacked, so the outer edge no longer runs off the viewport and should round like any block
    @media (max-width: 768px) {
        .split-flush .split-image,
        .split-flush :deep(.media-placeholder) {
            border-radius: var(--vt-c-radius-lg);
        }
    }
</style>
