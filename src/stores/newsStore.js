import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

export const useNewsStore = defineStore('news', () => {
	const items = ref(news)

	const allNews = computed(() =>
		[...items.value].sort((a, b) => new Date(b.date) - new Date(a.date))
	)

	const recentNews = computed(() => allNews.value.slice(0, 3))

	const availableTopics = computed(() => [...new Set(items.value.map((item) => item.topic))])

	function newsByTopic(topic) {
		return allNews.value.filter((item) => item.topic === topic)
	}

	return { allNews, recentNews, availableTopics, newsByTopic }
})
