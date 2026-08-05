import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { articles } from '@/content/articles'

export const useArticlesStore = defineStore('articles', () => {
	const items = ref(articles)

	const allArticles = computed(() => items.value)

	const byNewest = computed(() =>
		[...items.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
	)

	const recentArticles = computed(() => byNewest.value.slice(0, 3))
	const homeArticles = computed(() => byNewest.value.slice(0, 4))

	function getArticleById(id) {
		return items.value.find((article) => article.id === id)
	}

	return { allArticles, recentArticles, homeArticles, getArticleById }
})
