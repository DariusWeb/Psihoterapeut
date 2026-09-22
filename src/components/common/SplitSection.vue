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
        display: block;
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

    // Stacked, the image becomes the top edge of the shared bridge surface (see base.scss),
    // so it drops its own rounding and gives up height rather than pushing the copy off-screen.
    @media (max-width: 768px) {
        .split-image,
        .split-flush .split-image,
        :deep(.media-placeholder),
        .split-flush :deep(.media-placeholder) {
            border-radius: 0;
        }

        .split-image {
            min-height: 0;
            max-height: var(--media-cap-mobile);
        }
    }
</style>
