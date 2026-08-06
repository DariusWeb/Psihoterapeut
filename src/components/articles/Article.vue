<script setup>
    import { useRoute } from 'vue-router'
    import { computed, watchEffect, onUnmounted } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useArticlesStore } from '@/stores/articlesStore'
    import { applySeo, applyJsonLd } from '@/utils/seo'
    import { SITE, absoluteUrl } from '@/seo.config'
    import NotFound from '@/views/NotFound.vue'

    const route = useRoute()
    const articlesStore = useArticlesStore()
    const { t } = useI18n()

    const article = computed(() =>
        articlesStore.getArticleBySlug(route.params.slug)
    )

    watchEffect(() => {
        if (!article.value) {
            // Without this an unknown slug would serve the list page's title as a soft 404.
            applySeo({ title: t('seo.notFound.title'), description: t('seo.notFound.description'), path: route.path })
            applyJsonLd('article', null)
            return
        }

        applySeo({
            title: article.value.title,
            description: article.value.subtitle,
            path: route.path,
            image: article.value.image,
            type: 'article'
        })

        applyJsonLd('article', {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.value.title,
            description: article.value.subtitle,
            datePublished: article.value.createdAt,
            inLanguage: SITE.lang,
            mainEntityOfPage: absoluteUrl(route.path),
            author: { '@type': 'Person', name: SITE.name }
        })
    })

    onUnmounted(() => applyJsonLd('article', null))
</script>

<template>
    <main v-if="article" class="article-detail">
        <img v-if="article.image" :src="article.image" :alt="article.imageAlt ?? article.title" width="800"
            height="450" decoding="async" loading="eager" fetchpriority="high">
        <h1>{{ article.title }}</h1>
        <p class="article-subtitle">{{ article.subtitle }}</p>

        <!-- Render the article component -->
        <component :is="article.component" />
    </main>

    <NotFound v-else />
</template>

<style scoped lang="scss">
    // Reads as a heading but is not one — it is the h1's subtitle, not a section of its own.
    .article-subtitle {
        font-family: "Libre Baskerville", serif;
        font-size: var(--step-h2);
        color: var(--vt-c-jannafer-green);
        line-height: 1.2;
        margin-bottom: 1rem;
    }
</style>
