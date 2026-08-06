<script setup>
	import { useI18n } from 'vue-i18n'
	import { BatteryLow, CalendarX, Heart, Leaf, MessageCircleOff, Unlink, UserRoundSearch } from '@lucide/vue'

	const { t, tm, rt } = useI18n()

	const icons = [BatteryLow, CalendarX, UserRoundSearch, Unlink, MessageCircleOff, Heart]
</script>

<template>
	<section class="section-band stack stack-loose">
		<div class="section-head-center">
			<h2>{{ t('home.reasons.title') }}</h2>
			<Leaf class="section-flourish" :size="20" />
		</div>

		<ul class="card-grid home-reasons-grid">
			<li v-for="(reason, index) in tm('home.reasons.items')" :key="rt(reason)" class="feature-column">
				<component :is="icons[index]" class="feature-column-icon" :size="32" />
				{{ rt(reason) }}
			</li>
		</ul>

		<p class="home-reasons-closing">{{ t('home.reasons.closing') }}</p>
	</section>
</template>

<style scoped lang="scss">
	// Six fixed items, so only divisors of 6 avoid a stranded last row — a width-driven
	// track count cannot guarantee that, hence explicit columns on this one grid.
	.home-reasons-grid {
		--card-grid-gap: var(--vt-c-split-gap);
		grid-template-columns: repeat(2, 1fr);
	}

	@media (min-width: 560px) {
		.home-reasons-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 900px) {
		.home-reasons-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.home-reasons-closing {
		margin: 0;
		text-align: center;
		color: var(--vt-c-jannafer-green);
	}
</style>
