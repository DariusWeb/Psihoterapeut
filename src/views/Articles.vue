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

            <div class="articles-grid">
                <ArticleItem v-for="(article, index) in articlesStore.allArticles" :key="index" v-bind="article">
                    <p>{{ article.content }}</p>
                </ArticleItem>
            </div>
        </section>
    </main>
</template>

<style lang="scss" scoped>
    .articles-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-bottom: 4rem;
    }
</style>