<script setup>
    import { useI18n } from 'vue-i18n'
    import { useArticlesStore } from '@/stores/articlesStore'
    import ArticleItem from '@/components/articles/ArticleItem.vue'

    const { t } = useI18n()
    const articlesStore = useArticlesStore()
</script>

<template>
    <section class="recent-articles">
        <div class="section-header">
            <h2>{{ t('home.recentArticles.title') }}</h2>
        </div>

        <div class="articles-grid">
            <ArticleItem v-for="article in articlesStore.recentArticles" :key="article.id" v-bind="article">
                <p>{{ article.content }}</p>
            </ArticleItem>
        </div>

        <RouterLink to="/articles" class="view-more-articles">
            {{ t('button.viewAll') }}
        </RouterLink>
    </section>
</template>

<style lang="scss" scoped>
    .recent-articles {
        padding: 4rem 2rem;
        background: var(--color-background-soft);
    }

    .section-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .articles-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .view-more-articles {
        display: block;
        text-align: center;
    }
</style>