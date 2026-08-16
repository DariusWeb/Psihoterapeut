import { defineStore } from 'pinia'
import { computed } from 'vue'
import { news } from '@/content/news'

// Hand-ordered rather than derived from the data: this is the filter-button order.
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

export const useNewsStore = defineStore('news', () => {
	const allNews = computed(() => [...news].sort((a, b) => new Date(b.date) - new Date(a.date)))

	function newsByTopic(topic) {
		return allNews.value.filter((item) => item.topic === topic)
	}

	return { allNews, newsByTopic }
})
