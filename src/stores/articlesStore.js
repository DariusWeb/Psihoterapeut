import { defineStore } from 'pinia'
import { articles } from '@/content/articles'

export const useArticlesStore = defineStore('articles', {
    state: () => ({
        articles: articles
    }),

    getters: {
        // Get all articles
        allArticles: (state) => {
            return state.articles
        },

        // Get recent articles, sorted by date
        recentArticles: (state) => {
            return [...state.articles]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
        },

        // Get article by id
        getArticleById: (state) => (id) => {
            return state.articles.find(article => article.id === id)
        }
    }
})