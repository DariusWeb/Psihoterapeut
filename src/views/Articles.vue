<script setup>
    import { useI18n } from 'vue-i18n'
    import { useArticlesStore } from '@/stores/articlesStore'
    import ArticleItem from '@/components/articles/ArticleItem.vue'

    const { t } = useI18n()
    const articlesStore = useArticlesStore()
</script>

<template>
    <main class="page-articles">
        <section class="articles-header">
            <h1>{{ t('articles.title') }}</h1>

            <div class="articles-grid card-grid">
                <ArticleItem v-for="article in articlesStore.allArticles" :key="article.id" v-bind="article" />
            </div>
        </section>
    </main>
</template>

<style lang="scss" scoped>
    .articles-grid {
        --card-min: 17rem;
        --card-grid-gap: var(--vt-c-split-gap);
        margin-bottom: clamp(2rem, 1rem + 3vw, 4rem);
    }
</style>