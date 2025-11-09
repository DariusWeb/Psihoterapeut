import { defineStore } from 'pinia'
import { services } from '@/content/services'

export const useServicesStore = defineStore('services', {
    state: () => ({
        services: services
    }),

    getters: {
        // Get all services
        allServices: (state) => {
            return state.services
        },

        // Get home services
        homeServices: (state) => {
            return [...state.services]
                .sort((a, b) => a.id - b.id)
                .slice(0, 3)
        },

        // Get service by id
        getServiceById: (state) => (id) => {
            return state.services.find(service => service.id === id)
        }
    }
})