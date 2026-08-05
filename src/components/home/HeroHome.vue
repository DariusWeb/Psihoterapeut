<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Heart, Image } from '@lucide/vue'

	const { t } = useI18n()
</script>

<template>
	<section class="page-hero">
		<div class="page-hero-content">
			<h1 class="page-hero-title">{{ t('home.hero.title') }}</h1>
			<hr class="rule-short" />
			<p class="page-hero-intro home-hero-intro">{{ t('home.hero.intro') }}</p>

			<div class="home-hero-actions">
				<RouterLink class="button button-primary" to="/contact#contact-form">
					{{ t('home.hero.ctaPrimary') }}
				</RouterLink>

				<a class="button button-outline" href="#cum-lucrez">{{ t('home.hero.ctaSecondary') }}</a>
			</div>

			<p class="cta-band-note home-hero-note">
				<Heart :size="16" />
				{{ t('cta.note') }}
			</p>
		</div>

		<div class="page-hero-media media-placeholder media-fade bleed-right" role="img"
			:aria-label="t('home.hero.imageAlt')">
			<Image :size="40" />
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-hero-intro {
		max-width: 45ch; // narrower than the shared intro, so the CTA row sits under a tight column
	}

	.home-hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.home-hero-note {
		text-align: left; // the shared note centres itself for the CTA band; here it sits in a left column
	}
</style>
