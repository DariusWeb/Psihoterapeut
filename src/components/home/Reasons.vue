<script setup>
	import { useI18n } from 'vue-i18n'
	import { BatteryLow, CalendarX, Heart, MessageCircleOff, Unlink, UserRoundSearch } from '@lucide/vue'

	const { t, tm, rt } = useI18n()

	const icons = [BatteryLow, CalendarX, UserRoundSearch, Unlink, MessageCircleOff, Heart]
</script>

<template>
	<section class="band">
		<h2 class="section-title">{{ t('home.reasons.title') }}</h2>
		<ul v-reveal class="home-reasons">
			<li v-for="(reason, index) in tm('home.reasons.items')" :key="rt(reason)" class="home-reason text-pretty">
				<span class="home-reason-icon"><component :is="icons[index]" :size="22" /></span>
				{{ rt(reason) }}
			</li>
		</ul>
		<div class="home-reasons-closing">
			<p class="text-lead text-balance">{{ t('home.reasons.closing') }}</p>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-reasons {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--s-36) var(--s-48);
		padding: 0;
		list-style: none;
	}

	.home-reason {
		display: grid;
		grid-template-columns: 44px 1fr;
		gap: var(--s-16);
		align-items: center;
		font-family: var(--font-serif);
		font-size: var(--fs-serif-s);
		line-height: 1.45;
		color: var(--olive-700);
	}

	.home-reason-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.home-reasons-closing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-16);
		padding-top: var(--s-8);
		text-align: center;

		&::before {
			content: '';
			width: var(--hairline-w);
			height: 1.5px;
			background: var(--olive-600);
		}

		.text-lead {
			max-width: none;
			line-height: 1.6;
			letter-spacing: 0.01em;
			color: var(--olive-700);
		}
	}

	@media (max-width: 1023px) {
		.home-reasons {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 767px) {
		.home-reasons {
			grid-template-columns: 1fr;
			gap: 18px;
		}

		.home-reason {
			grid-template-columns: 40px 1fr;
			gap: var(--s-14);
		}

		.home-reason-icon {
			width: 40px;
			height: 40px;

			svg {
				width: 20px;
				height: 20px;
			}
		}

		.home-reasons-closing {
			gap: var(--s-14);
		}
	}
</style>
