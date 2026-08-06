import { ref, watch } from 'vue'
import i18n from '@/i18n'
import { useThemeStore } from '@/stores/themeStore'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const CONSENT_KEY = 'analytics-consent'

// 'granted' | 'denied' | null, where null means the visitor has not answered the banner yet.
export const analyticsConsent = ref(localStorage.getItem(CONSENT_KEY))

let posthog = null

// Only what PostHog cannot infer from the request itself — the site's own display and language state.
function siteContext() {
	return {
		theme_mode: localStorage.getItem('theme-preference') ?? 'system',
		theme_resolved: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
		site_language: i18n.global.locale.value,
		reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		connection: window.navigator.connection?.effectiveType ?? 'unknown'
	}
}

// Dynamically imported so a visitor who declines never downloads the library at all;
// disabling it after loading would still have shipped the bytes and pinged PostHog.
async function load() {
	if (posthog || !POSTHOG_KEY) return

	posthog = (await import('posthog-js')).default

	posthog.init(POSTHOG_KEY, {
		api_host: 'https://eu.i.posthog.com',
		ui_host: 'https://eu.posthog.com',
		// SPA pageviews, rageclicks, Google-app referrer detection, localhost tagged as test traffic.
		// Deliberately not '2026-06-25', which drops URL hashes and the site navigates by them.
		defaults: '2026-05-30',
		person_profiles: 'always',
		capture_performance: { web_vitals: true },
		mask_personal_data_properties: true,
		// visitors here read pages that reveal why they came; a replay of that is health data
		disable_session_recording: true
	})

	posthog.register(siteContext())

	const themeStore = useThemeStore()
	watch([i18n.global.locale, () => themeStore.resolvedTheme], () => posthog.register(siteContext()))
}

export function initAnalytics() {
	if (analyticsConsent.value === 'granted') load()
}

export function grantAnalyticsConsent() {
	localStorage.setItem(CONSENT_KEY, 'granted')
	analyticsConsent.value = 'granted'
	load()
}

export function denyAnalyticsConsent() {
	localStorage.setItem(CONSENT_KEY, 'denied')
	analyticsConsent.value = 'denied'
	// reset() wipes PostHog's own stored opt-out, so opting out has to follow it or it is undone
	posthog?.reset(true)
	posthog?.opt_out_capturing()
}

// Withdrawing has to be as easy as consenting, so the footer can put the banner back.
export function reopenAnalyticsConsent() {
	localStorage.removeItem(CONSENT_KEY)
	analyticsConsent.value = null
}

export function captureEvent(name, properties) {
	posthog?.capture(name, properties)
}
