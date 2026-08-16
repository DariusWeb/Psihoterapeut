import { defineStore } from 'pinia'
import { computed } from 'vue'
import { services } from '@/content/services'

export const useServicesStore = defineStore('services', () => {
	const homeServices = computed(() => [...services].sort((a, b) => a.id - b.id).slice(0, 3))

	function getServiceBySlug(slug) {
		return services.find((service) => service.slug === slug)
	}

	return { allServices: services, homeServices, getServiceBySlug }
})
