import { defineStore } from 'pinia'
import { computed } from 'vue'
import { articles } from '@/content/articles'

export const useArticlesStore = defineStore('articles', () => {
	const byNewest = computed(() =>
		[...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
	)

	const recentArticles = computed(() => byNewest.value.slice(0, 3))
	const homeArticles = computed(() => byNewest.value.slice(0, 4))

	function getArticleBySlug(slug) {
		return articles.find((article) => article.slug === slug)
	}

	return { allArticles: articles, recentArticles, homeArticles, getArticleBySlug }
})
