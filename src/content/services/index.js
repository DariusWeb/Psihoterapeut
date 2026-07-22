import Service from './Service.vue'
import Service2 from './Service2.vue'
import Service3 from './Service3.vue'

// To publish a new service, add its .vue file here; the `meta` export becomes the list entry.
const components = [
    Service,
    Service2,
    Service3
]

export const services = components.map(component => ({ ...component.meta, component }))
