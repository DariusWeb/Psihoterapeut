import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { articles } from '@/content/articles'

export const useArticlesStore = defineStore('articles', () => {
	const items = ref(articles)

	const allArticles = computed(() => items.value)

	const recentArticles = computed(() =>
		[...items.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
	)

	function getArticleById(id) {
		return items.value.find((article) => article.id === id)
	}

	return { allArticles, recentArticles, getArticleById }
})
