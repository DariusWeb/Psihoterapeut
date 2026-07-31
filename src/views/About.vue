<script setup>
	import { useI18n } from 'vue-i18n'
	import { CalendarDays, UserRound, BookOpen, Heart, Sprout, Leaf } from '@lucide/vue'
	import andreeaPortrait from '@/assets/images/about/andreea-portrait.webp'

	const { t } = useI18n()
</script>

<template>
	<main class="about-page">
		<section class="about-hero">
			<div class="about-hero-content">
				<h1 class="about-hero-title">{{ t('about.hero.title') }}</h1>
				<Leaf class="about-flourish" :size="28" />
				<p class="about-hero-intro">{{ t('about.hero.intro1') }}</p>
				<p class="about-hero-intro">{{ t('about.hero.intro2') }}</p>
				<RouterLink class="button about-hero-cta" to="/contact">
					<CalendarDays class="about-hero-cta-icon" :size="18" />
					{{ t('about.hero.cta') }}
				</RouterLink>
			</div>

			<img class="about-photo" :src="andreeaPortrait" :alt="t('about.hero.photoAlt')" width="1050"
				height="700" decoding="async" loading="eager" fetchpriority="high" />
		</section>

		<div class="about-cards">
			<section class="about-card">
				<h3 class="about-card-title">
					<UserRound class="about-card-icon" :size="24" />
					{{ t('about.story.title') }}
				</h3>
				<p class="about-card-text">{{ t('about.story.p1') }}</p>
				<p class="about-card-text">{{ t('about.story.p2') }}</p>
				<p class="about-card-text">{{ t('about.story.p3') }}</p>
				<p class="about-card-text">{{ t('about.story.p4') }}</p>
			</section>

			<section class="about-card">
				<h3 class="about-card-title">
					<BookOpen class="about-card-icon" :size="24" />
					{{ t('about.journey.title') }}
				</h3>
				<p class="about-card-text">{{ t('about.journey.p1') }}</p>
				<p class="about-card-text">{{ t('about.journey.p2') }}</p>
				<p class="about-card-text">{{ t('about.journey.p3') }}</p>
				<p class="about-card-text">{{ t('about.journey.p4') }}</p>
				<p class="about-card-text">{{ t('about.journey.p5') }}</p>
			</section>

			<section class="about-card">
				<h3 class="about-card-title">
					<Heart class="about-card-icon" :size="24" />
					{{ t('about.therapy.title') }}
				</h3>
				<p class="about-card-text">{{ t('about.therapy.p1') }}</p>
				<p class="about-card-text">{{ t('about.therapy.p2') }}</p>

				<div class="about-card-sub">
					<h3 class="about-card-subtitle">
						<Leaf class="about-card-icon" :size="20" />
						{{ t('about.therapy.moment.title') }}
					</h3>
					<p class="about-card-text">{{ t('about.therapy.moment.p1') }}</p>
					<p class="about-card-text">{{ t('about.therapy.moment.p2') }}</p>
				</div>
			</section>

			<section class="about-card">
				<h3 class="about-card-title">
					<Sprout class="about-card-icon" :size="24" />
					{{ t('about.work.title') }}
				</h3>
				<p class="about-card-text">{{ t('about.work.p1') }}</p>
				<p class="about-card-text">{{ t('about.work.p2') }}</p>
				<p class="about-card-text">{{ t('about.work.p3') }}</p>
				<p class="about-card-text">{{ t('about.work.p4') }}</p>
			</section>
		</div>
	</main>
</template>

<style scoped lang="scss">
	.about-page {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.about-hero {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 3rem;
	}

	.about-hero-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.about-hero-title {
		text-align: left;
		margin: 0;
	}

	.about-flourish {
		color: var(--vt-c-jannafer-green);
	}

	.about-hero-intro {
		margin: 0;
		line-height: 1.7;
	}

	.about-hero-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.about-photo {
		flex: 0 0 40%;
		max-width: 420px;
		align-self: stretch; // photo ends level with the CTA, matching the copy column
		height: auto; // the height attribute is a presentational hint; stretch only applies once it is auto
		object-fit: cover;
		border-radius: 1rem;
	}

	.about-cards {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.about-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 2rem;
		border: 1px solid var(--vt-c-jannafer-gray2);
		border-radius: 1rem;
	}

	.about-card-title,
	.about-card-subtitle {
		display: flex;
		align-items: self-start;
		gap: 0.75rem;
		margin: 0;
	}

	.about-card-icon {
		flex-shrink: 0;
		color: var(--vt-c-jannafer-green);
	}

	.about-card-text {
		margin: 0;
		line-height: 1.7;
	}

	.about-card-sub {
		margin-top: 0.5rem;
		padding-top: 1.5rem;
		border-top: 2px dashed var(--vt-c-jannafer-gray2);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (max-width: 1024px) {
		.about-hero {
			flex-direction: column;
			align-items: stretch;
		}

		.about-photo {
			flex-basis: auto;
			max-width: 100%;
			align-self: center;
			width: 100%;
			aspect-ratio: 3 / 4; // stacked there is no copy column to match, so fall back to a portrait crop
			max-height: 480px;
		}

		.about-cards {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.about-page {
			gap: 2rem;
		}

		.about-card {
			padding: 1.5rem;
		}
	}
</style>
