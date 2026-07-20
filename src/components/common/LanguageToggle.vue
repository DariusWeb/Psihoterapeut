<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'

const { locale } = useI18n({ useScope: 'global' })

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
	<div class="lang-toggle" role="group" aria-label="Language">
		<button
			v-for="lang in languages"
			:key="lang.code"
			class="lang-btn"
			:class="{ active: locale === lang.code }"
			:aria-label="lang.label"
			@click="setLocale(lang.code)"
		>
			{{ lang.label }}
		</button>
	</div>
</template>

<style scoped lang="scss">
.lang-toggle {
	display: flex;
	align-items: center;
	gap: 0.1rem;
	background: var(--vt-c-jannafer-gray2);
	border-radius: 2rem;
	padding: 0.2rem;
}

.lang-btn {
	padding: 0.25rem 0.6rem;
	border-radius: 2rem;
	border: none;
	background: transparent;
	color: var(--vt-c-black);
	font-size: 0.72rem;
	font-weight: 700;
	cursor: pointer;
	transition: all var(--vt-c-transition-speed);
	letter-spacing: 0.05em;

	&:hover {
		background: var(--vt-c-jannafer-gray2);
		color: var(--vt-c-jannafer-green);
	}

	&.active {
		background: var(--vt-c-jannafer-green);
		color: #fff;
	}
}
</style>
