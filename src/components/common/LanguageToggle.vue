<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'

const { locale, t } = useI18n({ useScope: 'global' })

const STORAGE_KEY = 'language-preference'
const languages = [
	{ code: 'ro', label: 'RO' },
	{ code: 'en', label: 'ENG' }
]

function setLocale(lang) {
	locale.value = lang
	localStorage.setItem(STORAGE_KEY, lang)
}

onMounted(() => {
	const saved = localStorage.getItem(STORAGE_KEY)
	if (saved && ['en', 'ro'].includes(saved)) {
		locale.value = saved
	}
})
</script>

<template>
	<div class="lang-toggle toggle-track" role="group" :aria-label="t('navigation.languageLabel')"
		:style="{ '--toggle-index': languages.findIndex((lang) => lang.code === locale) }">
		<span class="toggle-thumb" aria-hidden="true"></span>
		<button
			v-for="lang in languages"
			:key="lang.code"
			type="button"
			class="toggle-option"
			:aria-pressed="locale === lang.code"
			:aria-label="lang.label"
			@click="setLocale(lang.code)"
		>
			{{ lang.label }}
		</button>
	</div>
</template>

<style scoped lang="scss">
.lang-toggle {
	--toggle-w: 32px;
	--toggle-on: var(--olive-800);
}

.toggle-option {
	font: 600 11px var(--font-sans);
}
</style>
