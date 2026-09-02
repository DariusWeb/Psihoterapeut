import { Baby, Briefcase, Heart } from '@lucide/vue'
import Infertility from './Infertility.vue'
import Motherhood from './Motherhood.vue'
import Career from './Career.vue'

// Card copy lives in en.json under `events.groups.<key>`; the .vue file is the detail-page body.
export const groups = [
    { key: 'infertility', slug: 'infertilitate', icon: Heart, component: Infertility },
    { key: 'motherhood', slug: 'maternitate', icon: Baby, component: Motherhood },
    { key: 'career', slug: 'cariera', icon: Briefcase, component: Career }
]

export function getGroupBySlug(slug) {
    return groups.find((group) => group.slug === slug)
}
