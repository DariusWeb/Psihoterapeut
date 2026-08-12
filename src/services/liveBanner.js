import { ref } from 'vue'
import { captureEvent } from '@/services/analytics'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT
const DISMISSED_KEY = 'live-dismissed'
const POLL_MS = 60_000

export const liveAnnouncement = ref(null)

let lastReportedId = null

async function poll() {
	try {
		const response = await fetch(`${ENDPOINT}/live`)
		if (!response.ok) return

		const data = await response.json()
		const dismissed = sessionStorage.getItem(DISMISSED_KEY)

		if (!data.live || String(data.id) === dismissed) {
			liveAnnouncement.value = null
			return
		}

		liveAnnouncement.value = data

		if (lastReportedId !== data.id) {
			lastReportedId = data.id
			captureEvent('live_banner_shown', { platform: data.platform, announcement_id: data.id })
		}
	} catch {
		// The announcement is never worth breaking a page over — keep whatever is on screen.
	}
}

export function initLiveBanner() {
	if (!ENDPOINT) return

	poll()
	setInterval(() => document.visibilityState === 'visible' && poll(), POLL_MS)
	document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && poll())
}

export function dismissLive() {
	const { id, platform } = liveAnnouncement.value
	sessionStorage.setItem(DISMISSED_KEY, String(id))
	liveAnnouncement.value = null
	captureEvent('live_banner_dismissed', { platform, announcement_id: id })
}

export function reportLiveClick() {
	const { id, platform } = liveAnnouncement.value
	captureEvent('live_banner_clicked', { platform, announcement_id: id })
}
