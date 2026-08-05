import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { events } from '@/content/events'

export const useEventsStore = defineStore('events', () => {
	const items = ref(events)

	const allEvents = computed(() =>
		[...items.value].sort((a, b) => new Date(a.date) - new Date(b.date))
	)

	const upcomingEvents = computed(() => {
		const today = new Date().toISOString().split('T')[0]
		return allEvents.value.filter((event) => event.date >= today)
	})

	// Resolves past events too, so a shared link to a finished event still opens.
	function getEventById(id) {
		return items.value.find((event) => event.id === id)
	}

	return { allEvents, upcomingEvents, getEventById }
})
