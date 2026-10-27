<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Monitor, Moon, Sun } from '@lucide/vue'
import { useThemeStore } from '@/stores/themeStore'

const { t } = useI18n()
const themeStore = useThemeStore()

const options = [
	{ value: 'light', icon: Sun },
	{ value: 'dark', icon: Moon },
	{ value: 'system', icon: Monitor },
]
const activeIndex = computed(() => options.findIndex((option) => option.value === themeStore.mode))
</script>

<template>
	<div class="theme-toggle toggle-track" role="group" :aria-label="t('navigation.theme.label')"
		:style="{ '--toggle-index': activeIndex }">
		<span class="toggle-thumb" aria-hidden="true"></span>
		<button
			v-for="option in options"
			:key="option.value"
			type="button"
			class="toggle-option"
			:aria-pressed="themeStore.mode === option.value"
			:aria-label="t(`navigation.theme.${option.value}`)"
			:title="t(`navigation.theme.${option.value}`)"
			@click="themeStore.setMode(option.value)"
		>
			<component :is="option.icon" :size="14" aria-hidden="true" />
		</button>
	</div>
</template>

<style scoped lang="scss">
.theme-toggle {
	--toggle-w: 28px;
	--toggle-on: var(--olive-700);
}
</style>
