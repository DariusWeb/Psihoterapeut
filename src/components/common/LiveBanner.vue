<script setup>
	import { useI18n } from 'vue-i18n'
	import { Radio, X } from '@lucide/vue'
	import { consentBannerPending } from '@/services/analytics'
	import { liveAnnouncement, dismissLive, reportLiveClick } from '@/services/liveBanner'

	const { t } = useI18n()
</script>

<template>
	<!-- Mounted before its text: inserting a live region and its text together is unreliably announced. -->
	<aside class="live-region" role="status">
		<div v-if="liveAnnouncement && !consentBannerPending" class="live-banner float-banner float-banner-docked">
			<Radio :size="20" />

			<div class="live-copy float-banner-copy">
				<p class="float-banner-title">{{ liveAnnouncement.title }}</p>
				<p v-if="liveAnnouncement.text" class="float-banner-text">{{ liveAnnouncement.text }}</p>
			</div>

			<a
				v-if="liveAnnouncement.url"
				class="button-primary"
				:href="liveAnnouncement.url"
				target="_blank"
				rel="noopener noreferrer"
				@click="reportLiveClick"
			>
				{{ liveAnnouncement.ctaLabel || t('live.watch') }}
			</a>

			<button type="button" class="icon-button icon-button-bare" :aria-label="t('live.dismiss')" @click="dismissLive">
				<X :size="18" />
			</button>
		</div>
	</aside>
</template>

<style lang="scss" scoped>
	.live-banner {
		z-index: 199; // just under the consent banner, which suppresses this one anyway
	}

	@media (max-width: 767px) {
		.live-banner {
			flex-wrap: wrap;
		}

		.live-copy {
			flex-basis: calc(100% - 96px);
		}

		.button-primary {
			order: 1;
			flex: 1;
		}
	}
</style>
