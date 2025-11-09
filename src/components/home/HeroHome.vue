<script setup>
	import { useI18n } from 'vue-i18n'
	import Hero from '@/components/common/Hero.vue'
	import andreeaImage from '@/assets/images/andreea.jpg'

	const { t } = useI18n()
</script>

<template>
	<div class="hero-home layout-full">
		<Hero class="layout-container" :title="t('hero.title')" :subtitle="t('hero.subtitle')" :quote="t('hero.quote')"
			:cta="t('hero.cta')" :image="andreeaImage" />
	</div>
</template>

<style scoped lang="scss">
	.hero-home {
		padding: var(--vt-c-section-padding);
		background: var(--vt-c-jannafer-gray);
	}
</style>
