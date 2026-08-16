<script setup>
	import { useI18n } from 'vue-i18n'
	import { Radio, X } from '@lucide/vue'
	import { consentBannerPending } from '@/services/analytics'
	import { liveAnnouncement, dismissLive, reportLiveClick } from '@/services/liveBanner'

	const { t } = useI18n()
</script>

<template>
	<!-- The wrapper stays mounted so the live region exists before its text does; inserting
	     both at once is unreliably announced, and this appears while someone is reading. -->
	<aside class="live-region" role="status">
		<div v-if="liveAnnouncement && !consentBannerPending" class="live-banner card">
			<Radio class="live-icon" :size="24" />

			<div class="live-copy">
				<p class="live-title">{{ liveAnnouncement.title }}</p>
				<p v-if="liveAnnouncement.text" class="live-text">{{ liveAnnouncement.text }}</p>
			</div>

			<a
				v-if="liveAnnouncement.url"
				class="button button-primary live-cta"
				:href="liveAnnouncement.url"
				target="_blank"
				rel="noopener noreferrer"
				@click="reportLiveClick"
			>
				{{ liveAnnouncement.ctaLabel || t('live.watch') }}
			</a>

			<button class="live-dismiss" :aria-label="t('live.dismiss')" @click="dismissLive">
				<X :size="20" />
			</button>
		</div>
	</aside>
</template>

<style lang="scss" scoped>
	.live-banner {
		position: fixed;
		inset-inline: var(--page-gutter);
		bottom: var(--page-gutter);
		z-index: 199; // just under the consent banner, which suppresses this one anyway
		max-width: var(--vt-c-container-width);
		margin-inline: auto;
		display: flex;
		align-items: center;
		gap: clamp(0.75rem, 0.5rem + 1.2vw, 1.5rem);
		padding: var(--card-padding-compact);
		box-shadow: 0 0.5rem 2rem rgb(from var(--vt-c-black) r g b / 15%);
	}

	.live-icon {
		flex-shrink: 0;
		color: var(--vt-c-jannafer-green);
	}

	.live-copy {
		min-width: 0;
	}

	.live-title {
		margin: 0;
		font-weight: 700;
	}

	.live-text {
		margin: 0.15rem 0 0;
		font-size: 0.9rem;
	}

	.live-cta {
		margin-inline-start: auto;
		white-space: nowrap;
	}

	.live-dismiss {
		flex-shrink: 0;
		display: flex;
		padding: 0.25rem;
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		border-radius: var(--vt-c-border-radius);
	}

	@media (max-width: 768px) {
		.live-banner {
			flex-wrap: wrap;
			padding-inline-end: calc(var(--card-padding-compact) + 1.5rem);
		}

		.live-copy {
			flex: 1;
		}

		.live-cta {
			flex-basis: 100%;
			margin-inline-start: 0;
			text-align: center;
		}

		.live-dismiss {
			position: absolute;
			inset-block-start: 0.5rem;
			inset-inline-end: 0.5rem;
		}
	}
</style>
