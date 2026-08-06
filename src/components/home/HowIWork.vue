<script setup>
	import { useI18n } from 'vue-i18n'
	import { Clock, Heart, Leaf, ShieldCheck, Sprout } from '@lucide/vue'

	const { t, tm, rt } = useI18n()

	const icons = [Sprout, Clock, Heart, ShieldCheck]
</script>

<template>
	<section id="cum-lucrez" class="section-band stack stack-loose home-work">
		<div class="section-head-center">
			<h2>{{ t('home.work.title') }}</h2>
			<Leaf class="section-flourish" :size="20" />
		</div>

		<ul class="card-grid home-work-grid">
			<li v-for="(item, index) in tm('home.work.items')" :key="rt(item.title)" class="feature-column">
				<component :is="icons[index]" class="feature-column-icon" :size="32" />
				<h3 class="card-title">{{ rt(item.title) }}</h3>
				<p class="home-work-text">{{ rt(item.text) }}</p>
			</li>
		</ul>

		<p class="home-work-closing">{{ t('home.work.closing') }}</p>
	</section>
</template>

<style scoped lang="scss">
	.home-work {
		scroll-margin-top: 6rem; // the hero's "Descoperă cum lucrez" anchor lands here, under a fixed nav
	}

	// Four fixed steps: a width-driven track count strands the fourth at 3-across widths.
	.home-work-grid {
		--card-grid-gap: var(--vt-c-split-gap);
		grid-template-columns: repeat(2, 1fr);
	}

	.home-work-text {
		margin: 0;
	}

	.home-work-closing {
		margin: 0;
		max-width: 70ch;
		align-self: center;
		text-align: center;
	}

	// The dividing rules only make sense while all four sit on one row.
	@media (min-width: 900px) {
		.home-work-grid {
			grid-template-columns: repeat(4, 1fr);
		}

		.home-work-grid .feature-column + .feature-column {
			border-left: 1px solid var(--vt-c-jannafer-gray2);
			padding-left: var(--vt-c-split-gap);
		}
	}
</style>
