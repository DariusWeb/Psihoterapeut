import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'theme-preference'
const VALID_MODES = ['light', 'dark', 'system']

export const useThemeStore = defineStore('theme', () => {
	const mode = ref('system')

	const resolvedTheme = computed(() => {
		if (mode.value === 'system') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		}
		return mode.value
	})

	function applyTheme() {
		if (resolvedTheme.value === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}

	function setMode(newMode) {
		if (!VALID_MODES.includes(newMode)) return
		mode.value = newMode
		localStorage.setItem(STORAGE_KEY, newMode)
		applyTheme()
	}

	function handleSystemChange() {
		if (mode.value === 'system') {
			applyTheme()
		}
	}

	// Called once from App.vue; the listener lives as long as the app, so there is no teardown.
	function initTheme() {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved && VALID_MODES.includes(saved)) {
			mode.value = saved
		}
		applyTheme()

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemChange)
	}

	return { mode, resolvedTheme, setMode, initTheme }
})
