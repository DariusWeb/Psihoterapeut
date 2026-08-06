<script setup>
	import { useI18n } from 'vue-i18n'
	import HeroHome from '@/components/home/HeroHome.vue'
	import Reasons from '@/components/home/Reasons.vue'
	import Areas from '@/components/home/Areas.vue'
	import HowIWork from '@/components/home/HowIWork.vue'
	import AboutJourney from '@/components/home/AboutJourney.vue'
	import RecentArticles from '@/components/home/RecentArticles.vue'
	import Faq from '@/components/home/Faq.vue'
	import Newsletter from '@/components/common/Newsletter.vue'
	import CtaBand from '@/components/common/CtaBand.vue'

	const { t } = useI18n()
</script>

<template>
	<main class="page-home layout-stack">
		<HeroHome />
		<Reasons />
		<Areas />
		<HowIWork />
		<AboutJourney />
		<RecentArticles />
		<Faq />

		<CtaBand :title="t('home.cta.title')" :text="t('home.cta.text')" />

		<Newsletter />
	</main>
</template>

<style lang="scss" scoped>
	.page-home {
		--vt-c-section-gap: clamp(1.5rem, 0.5rem + 4vw, 4rem);
		// the hero media runs flush to the top, behind the fixed nav
		--page-pad-top: 0;
		--page-pad-bottom: 0;
	}
</style>
