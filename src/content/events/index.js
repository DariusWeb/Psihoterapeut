import Event from './Event.vue'
import Event2 from './Event2.vue'
import Event3 from './Event3.vue'
import Event4 from './Event4.vue'

// To publish a new event, add its .vue file here; the `meta` export becomes the list entry.
const components = [
    Event,
    Event2,
    Event3,
    Event4
]

export const events = components.map(component => ({ ...component.meta, component }))
