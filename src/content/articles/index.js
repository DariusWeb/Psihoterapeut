import ManagingAnxiety from './Managing-anxiety.vue'
import ManagingAnxiety2 from './Managing-anxiety2.vue'

// To publish a new article, add its .vue file here; the `meta` export becomes the list entry.
const components = [
    ManagingAnxiety,
    ManagingAnxiety2
]

export const articles = components.map(component => ({ ...component.meta, component }))
