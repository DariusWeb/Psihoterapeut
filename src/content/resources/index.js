import { BookOpen, ClipboardList, Leaf, Wind } from '@lucide/vue'

// Copy lives in en.json under `resources.<collection>.<key>`; this file only describes each card's shape.
// Mocked until the real downloads exist — no card has a destination yet.
export const freeGuides = [
    { key: 'anxiety' },
    { key: 'journal' },
    { key: 'couple' }
]

export const practicalResources = [
    { key: 'stressTest', icon: Leaf },
    { key: 'lifeWheel', icon: ClipboardList },
    { key: 'breathing', icon: Wind },
    { key: 'thoughtJournal', icon: BookOpen }
]

export const premiumGuides = [
    { key: 'loss' },
    { key: 'identity' },
    { key: 'balance' }
]
