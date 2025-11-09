import ManagingAnxiety from './Managing-anxiety.vue'
import ManagingAnxiety2 from './Managing-anxiety2.vue'

// Add all article components here
export const articleComponents = [
    ManagingAnxiety,
    ManagingAnxiety2
    // Add more articles
]

// Export articles metadata
export const articles = articleComponents.map(component => ({
    ...component.articleMeta,
    component
}))