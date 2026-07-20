<script setup>
    import { ref, computed } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useNewsStore } from '@/stores/newsStore'
    import NewsItem from '@/components/news/NewsItem.vue'
    import NewsFilter from '@/components/news/NewsFilter.vue'

    const { t } = useI18n()
    const newsStore = useNewsStore()

    const activeTopic = ref('all')

    const filteredNews = computed(() =>
        activeTopic.value === 'all'
            ? newsStore.allNews
            : newsStore.newsByTopic(activeTopic.value)
    )
</script>

<template>
    <main class="page-news">
        <section class="news-header">
            <h1>{{ t('news.title') }}</h1>
            <p class="news-subtitle">{{ t('news.subtitle') }}</p>
        </section>

        <section class="news-content">
            <NewsFilter v-model="activeTopic" />

            <div v-if="filteredNews.length" class="news-grid">
                <NewsItem v-for="item in filteredNews" :key="item.id" v-bind="item" />
            </div>

            <p v-else class="news-empty">{{ t('news.noResults') }}</p>
        </section>
    </main>
</template>

<style lang="scss" scoped>
    .page-news {
        padding-top: 5rem;
    }

    .news-header {
        text-align: center;
        padding: 4rem 2rem 2rem;

        h1 {
            font-size: 2.4rem;
            margin-bottom: 0.75rem;
        }
    }

    .news-subtitle {
        font-size: 1.05rem;
        color: rgb(from var(--vt-c-black) r g b / 65%);
        max-width: 560px;
        margin: 0 auto;
    }

    .news-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 2rem 5rem;
    }

    .news-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;

        @media (max-width: 1024px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .news-empty {
        text-align: center;
        padding: 4rem 0;
        color: rgb(from var(--vt-c-black) r g b / 65%);
        font-size: 1rem;
    }
</style>
