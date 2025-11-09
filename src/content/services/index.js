import Service from './Service.vue'
import Service2 from './Service2.vue'

// Add all service components here
export const serviceComponents = [
    Service,
    Service2
    // Add more services
]

// Export services metadata
export const services = serviceComponents.map(component => ({
    ...component.serviceMeta,
    component
}))