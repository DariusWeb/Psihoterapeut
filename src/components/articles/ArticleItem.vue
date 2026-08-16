<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()

    defineProps({
        title: String,
        subtitle: String,
        image: String,
        imageAlt: String,
        id: Number,
        slug: String
    })
</script>

<template>
    <article class="article-item">
        <div v-if="image" class="article-image">
            <img :src="image" :alt="imageAlt ?? title" width="600" height="400" decoding="async" loading="lazy">
        </div>

        <div class="article-content">
            <h2 class="article-title">{{ title }}</h2>
            <p v-if="subtitle">{{ subtitle }}</p>

            <RouterLink :to="`/articole/${slug}`" class="article-link">
                {{ t('button.readMore') }}
            </RouterLink>
        </div>
    </article>
</template>

<style lang="scss" scoped>
    .article-item {
        background: var(--vt-c-white);
        border-radius: var(--vt-c-border-radius);
        overflow: hidden;
        box-shadow: var(--vt-c-shadow);
    }

    .article-image {
        height: 200px;
        background: var(--vt-c-surface-strong);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .article-content {
        padding: 1.5rem;
    }

    // h2 for the page outline, h3 type scale because it is a card title
    .article-title {
        font-size: var(--step-h3);
        font-weight: 600;
    }

    .article-link {
        display: inline-block;
        margin-top: 1rem;
        color: var(--vt-c-jannafer-green);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
</style>