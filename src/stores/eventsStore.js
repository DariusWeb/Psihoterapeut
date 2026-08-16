import { defineStore } from 'pinia'
import { computed } from 'vue'
import { events } from '@/content/events'

export const useEventsStore = defineStore('events', () => {
	const byDate = computed(() => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)))

	const upcomingEvents = computed(() => {
		const today = new Date().toISOString().split('T')[0]
		return byDate.value.filter((event) => event.date >= today)
	})

	// Resolves past events too, so a shared link to a finished event still opens.
	function getEventBySlug(slug) {
		return events.find((event) => event.slug === slug)
	}

	return { upcomingEvents, getEventBySlug }
})
