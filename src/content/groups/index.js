import { Baby, Briefcase, Heart } from '@lucide/vue'

// Copy lives in en.json under `events.groups.<key>`; this file only describes each card's shape.
// Recurring support groups — no dates, no detail pages, so this list is read straight by the view.
export const groups = [
    { key: 'infertility', icon: Heart },
    { key: 'motherhood', icon: Baby },
    { key: 'career', icon: Briefcase }
]
