import { ArrowRight, ClipboardCheck, Download, NotebookPen, Sprout } from '@lucide/vue'

// Copy lives in en.json under `resources.<collection>.<key>`; this file only describes each card's shape.
// Mocked until the real downloads exist — no card has a destination yet.
export const freeGuides = [
    { key: 'anxiety' },
    { key: 'journal' },
    { key: 'couple' }
]

// `icon` follows the label's kind (test, exercise, practice); `actionIcon` follows what the action does.
export const practicalResources = [
    { key: 'stressTest', icon: ClipboardCheck, actionIcon: ArrowRight },
    { key: 'lifeWheel', icon: NotebookPen, actionIcon: Download },
    { key: 'breathing', icon: Sprout, actionIcon: Download },
    { key: 'thoughtJournal', icon: NotebookPen, actionIcon: Download }
]

export const premiumGuides = [
    { key: 'loss' },
    { key: 'identity' },
    { key: 'balance' }
]
