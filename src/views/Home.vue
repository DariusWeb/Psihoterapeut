<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import HeroHome from '@/components/home/HeroHome.vue'
	import Reasons from '@/components/home/Reasons.vue'
	import Areas from '@/components/home/Areas.vue'
	import HowIWork from '@/components/home/HowIWork.vue'
	import AboutJourney from '@/components/home/AboutJourney.vue'
	import RecentArticles from '@/components/home/RecentArticles.vue'
	import Faq from '@/components/home/Faq.vue'
	import Newsletter from '@/components/common/Newsletter.vue'

	const { t } = useI18n()
</script>

<template>
	<main class="bands">
		<HeroHome />
		<Reasons />
		<Areas />
		<HowIWork />
		<AboutJourney />
		<RecentArticles />
		<Faq />

		<section class="band">
			<div class="split-7-5 home-invitation">
				<div class="statement">
					<h2 class="statement-title text-h1 text-balance">{{ t('home.cta.title') }}</h2>
					<p class="text-lead">{{ t('home.cta.text') }}</p>
				</div>
				<div class="home-invitation-actions">
					<div class="actions">
						<RouterLink class="button-primary" to="/programare">{{ t('cta.button') }}</RouterLink>
						<RouterLink class="button-outline" to="/contact">{{ t('booking.hero.alternativeLink') }}</RouterLink>
					</div>
					<p class="heart-line">{{ t('cta.note') }}</p>
				</div>
			</div>
		</section>

		<Newsletter />
	</main>
</template>

<style lang="scss" scoped>
	.home-invitation {
		align-items: center;
	}

	.home-invitation-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-16);
	}

	@media (max-width: 767px) {
		.home-invitation {
			gap: var(--s-16);
		}
	}
</style>
