<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { useNewsStore } from '@/stores/newsStore'
    import NewsItem from '@/components/news/NewsItem.vue'

    const { t } = useI18n()
    const newsStore = useNewsStore()
</script>

<template>
    <section class="recent-news">
        <div class="section-header">
            <h2>{{ t('news.recentNews.title') }}</h2>
        </div>

        <div class="news-grid">
            <NewsItem v-for="item in newsStore.recentNews" :key="item.id" v-bind="item" />
        </div>

        <RouterLink to="/news" class="view-more-news">
            {{ t('news.recentNews.viewAll') }}
        </RouterLink>
    </section>
</template>

<style lang="scss" scoped>
    .recent-news {
        padding: 4rem 2rem;
    }

    .section-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .news-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto 2rem;

        @media (max-width: 1024px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .view-more-news {
        display: table;
        margin: 0 auto;
    }
</style>
