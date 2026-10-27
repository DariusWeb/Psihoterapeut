import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'theme-preference'
const VALID_MODES = ['light', 'dark', 'system']

export const useThemeStore = defineStore('theme', () => {
	const mode = ref('system')
	// A ref, not a matchMedia read inside the computed: that read isn't reactive, so the computed cached the first answer.
	const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
	const systemDark = ref(darkQuery.matches)

	const resolvedTheme = computed(() => {
		if (mode.value === 'system') {
			return systemDark.value ? 'dark' : 'light'
		}
		return mode.value
	})

	function applyTheme(crossFade = false) {
		const flip = () => document.documentElement.classList.toggle('dark', resolvedTheme.value === 'dark')
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (crossFade && document.startViewTransition && !reduceMotion) document.startViewTransition(flip)
		else flip()
	}

	function setMode(newMode) {
		if (!VALID_MODES.includes(newMode)) return
		mode.value = newMode
		localStorage.setItem(STORAGE_KEY, newMode)
		applyTheme(true)
	}

	function handleSystemChange(event) {
		systemDark.value = event.matches
		if (mode.value === 'system') {
			applyTheme(true)
		}
	}

	// Called once from App.vue; the listener lives as long as the app, so there is no teardown.
	function initTheme() {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved && VALID_MODES.includes(saved)) {
			mode.value = saved
		}
		applyTheme()

		darkQuery.addEventListener('change', handleSystemChange)
	}

	return { mode, resolvedTheme, setMode, initTheme }
})
