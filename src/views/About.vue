<script setup>
	import { useI18n } from 'vue-i18n'
	import Hero from '@/components/common/Hero.vue'
	import andreeaImage from '@/assets/images/andreea.jpg'

	const { t } = useI18n()
</script>

<template>
	<main class="about-page">
		<Hero :title="t('hero.title')" :subtitle="t('about.intro')" :cta="t('hero.cta')" :image="andreeaImage" />

		<div class="columns-container">
			<section class="about-experience">
				<h2>{{ t('about.experience.title') }}</h2>
				<p>{{ t('about.experience.corporate') }}</p>
				<p>{{ t('about.experience.academic') }}</p>
				<p>{{ t('about.experience.research') }}</p>
			</section>

			<section class="about-commitment">
				<h2>{{ t('about.commitment.title') }}</h2>
				<p>{{ t('about.commitment.mission') }}</p>
				<p>{{ t('about.commitment.invitation') }}</p>
			</section>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	.about-page {
		.columns-container {
			padding-top: 3rem;
			border-top: 1px solid var(--vt-c-jannafer-gray2);
		}

		section {
			margin-bottom: 3rem;
		}

		h2 {
			margin-bottom: 1.5rem;
		}

		p {
			line-height: 1.6;
			margin-bottom: 1.5rem;
		}
	}
</style>
