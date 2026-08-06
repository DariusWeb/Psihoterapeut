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

            <div v-if="filteredNews.length" class="news-grid card-grid">
                <NewsItem v-for="item in filteredNews" :key="item.id" v-bind="item" />
            </div>

            <p v-else class="news-empty">{{ t('news.noResults') }}</p>
        </section>
    </main>
</template>

<style lang="scss" scoped>
    .news-header {
        text-align: center;
        margin-bottom: clamp(1.5rem, 0.75rem + 2.4vw, 3rem);

        h1 {
            margin-bottom: 0.75rem;
        }
    }

    .news-subtitle {
        font-size: 1.05rem;
        color: rgb(from var(--vt-c-black) r g b / 65%);
        max-width: 560px;
        margin: 0 auto;
    }

    .news-grid {
        --card-min: 17rem;
        --card-grid-gap: var(--vt-c-split-gap);
    }

    .news-empty {
        text-align: center;
        padding: clamp(2rem, 1rem + 3vw, 4rem) 0;
        color: rgb(from var(--vt-c-black) r g b / 65%);
        font-size: 1rem;
    }
</style>
