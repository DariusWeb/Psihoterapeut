import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { services } from '@/content/services'

export const useServicesStore = defineStore('services', () => {
	const items = ref(services)

	const allServices = computed(() => items.value)

	const homeServices = computed(() => [...items.value].sort((a, b) => a.id - b.id).slice(0, 3))

	function getServiceById(id) {
		return items.value.find((service) => service.id === id)
	}

	function getServiceBySlug(slug) {
		return items.value.find((service) => service.slug === slug)
	}

	return { allServices, homeServices, getServiceById, getServiceBySlug }
})
