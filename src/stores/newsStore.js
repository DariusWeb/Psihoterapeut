import { defineStore } from 'pinia'
import { news } from '@/content/news'

export const TOPICS = [
    'anxietate',
    'caut-psiholog-pentru-interviu',
    'depresie',
    'expert-sanatate-mintala',
    'infertility-psychotherapy',
    'infertility-workshop',
    'interviu-psiholog',
    'psiholog-opinie',
    'research-infertility',
    'research-psychotherapy',
    'terapie-de-cuplu-bucuresti',
]

export const useNewsStore = defineStore('news', {
    state: () => ({
        news: news,
    }),

    getters: {
        // All news sorted newest first
        allNews: (state) =>
            [...state.news].sort((a, b) => new Date(b.date) - new Date(a.date)),

        // Recent news for the home widget (latest 3 across all topics)
        recentNews: (state) =>
            [...state.news]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3),

        // News filtered by topic
        newsByTopic: (state) => (topic) =>
            [...state.news]
                .filter((item) => item.topic === topic)
                .sort((a, b) => new Date(b.date) - new Date(a.date)),

        // All available topic slugs that have at least one item
        availableTopics: (state) => [...new Set(state.news.map((item) => item.topic))],
    },
})
