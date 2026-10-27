<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Image } from '@lucide/vue'

	const { t } = useI18n()
</script>

<template>
	<section class="hero-grid">
		<div class="hero-grid-text statement">
			<h1 class="statement-title">{{ t('home.hero.title') }}</h1>
			<p class="text-lead">{{ t('home.hero.intro') }}</p>
			<div class="actions">
				<RouterLink class="button-primary" to="/programare">{{ t('home.hero.ctaPrimary') }}</RouterLink>
				<a class="button-outline" href="#cum-lucrez">{{ t('home.hero.ctaSecondary') }}</a>
			</div>
			<p class="heart-line">{{ t('cta.note') }}</p>
		</div>
		<div class="hero-grid-media media-placeholder home-hero-placeholder" role="img" :aria-label="t('home.hero.imageAlt')">
			<Image :size="40" />
		</div>
	</section>
</template>

<style scoped lang="scss">
	// No hero photo yet; the text column sets the row height, as it will for the real one.
	.home-hero-placeholder {
		min-height: 0;
	}
</style>
