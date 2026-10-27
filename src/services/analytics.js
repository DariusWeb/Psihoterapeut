import { computed, ref, watch } from 'vue'
import i18n from '@/i18n'
import { useThemeStore } from '@/stores/themeStore'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const CONSENT_KEY = 'analytics-consent'

// 'granted' | 'denied' | null, where null means the visitor has not answered the banner yet.
export const analyticsConsent = ref(localStorage.getItem(CONSENT_KEY))

// The consent banner owns the bottom of the screen until answered; other docked banners wait.
export const consentBannerPending = computed(() => analyticsConsent.value === null)

let posthog = null

// Only display state PostHog can't infer; the theme comes from the store, as actually rendered.
function siteContext(themeStore) {
	return {
		theme_mode: themeStore.mode,
		theme_resolved: themeStore.resolvedTheme,
		site_language: i18n.global.locale.value,
		reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		connection: window.navigator.connection?.effectiveType ?? 'unknown'
	}
}

// Imported on demand, so a visitor who declines never downloads the library or pings PostHog.
async function load() {
	if (posthog || !POSTHOG_KEY) return

	posthog = (await import('posthog-js')).default

	posthog.init(POSTHOG_KEY, {
		api_host: 'https://eu.i.posthog.com',
		ui_host: 'https://eu.posthog.com',
		// Not '2026-06-25': that version drops URL hashes, and the site navigates by them.
		defaults: '2026-05-30',
		person_profiles: 'always',
		capture_performance: { web_vitals: true },
		mask_personal_data_properties: true,
		// visitors here read pages that reveal why they came; a replay of that is health data
		disable_session_recording: true
	})

	const themeStore = useThemeStore()
	posthog.register(siteContext(themeStore))

	watch(
		[i18n.global.locale, () => themeStore.resolvedTheme],
		() => posthog.register(siteContext(themeStore))
	)
}

export function initAnalytics() {
	if (analyticsConsent.value === 'granted') load()
}

export function grantAnalyticsConsent() {
	localStorage.setItem(CONSENT_KEY, 'granted')
	analyticsConsent.value = 'granted'
	// Re-granting after a decline: load() returns early on a loaded library, so opt back in here.
	if (posthog) posthog.opt_in_capturing()
	else load()
}

// reset() wipes PostHog's own stored opt-out, so opting out has to follow it or it is undone.
function stopCapturing() {
	posthog?.reset(true)
	posthog?.opt_out_capturing()
}

export function denyAnalyticsConsent() {
	localStorage.setItem(CONSENT_KEY, 'denied')
	analyticsConsent.value = 'denied'
	stopCapturing()
}

// Withdrawing must be as easy as consenting; capture stops until the banner is answered again.
export function reopenAnalyticsConsent() {
	localStorage.removeItem(CONSENT_KEY)
	analyticsConsent.value = null
	stopCapturing()
}

export function captureEvent(name, properties) {
	posthog?.capture(name, properties)
}
