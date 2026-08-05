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
	.home-reasons-grid {
		--card-columns: 6;
		gap: 2rem;
	}

	.home-reasons-closing {
		margin: 0;
		text-align: center;
		color: var(--vt-c-jannafer-green);
	}
</style>
