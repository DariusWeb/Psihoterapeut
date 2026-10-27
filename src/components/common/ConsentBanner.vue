<script setup>
	import { useI18n } from 'vue-i18n'
	import { RouterLink } from 'vue-router'
	import { ShieldCheck } from '@lucide/vue'
	import {
		consentBannerPending,
		grantAnalyticsConsent,
		denyAnalyticsConsent
	} from '@/services/analytics'

	const { t } = useI18n()
</script>

<template>
	<aside v-if="consentBannerPending" class="consent-banner float-banner float-banner-docked" role="region"
		:aria-label="t('consent.title')">
		<ShieldCheck :size="20" />

		<p class="consent-text">
			{{ t('consent.body') }}
			<RouterLink class="text-link" to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>.
		</p>

		<button type="button" class="button-outline consent-button" @click="denyAnalyticsConsent">
			{{ t('consent.decline') }}
		</button>
		<button type="button" class="button-outline consent-button" @click="grantAnalyticsConsent">
			{{ t('consent.accept') }}
		</button>
	</aside>
</template>

<style lang="scss" scoped>
	.consent-banner {
		z-index: 200; // the sticky header sits at 100
	}

	.consent-text {
		flex: 1;
		font-size: var(--fs-small);
		line-height: 1.5;
	}

	.consent-button {
		font-size: var(--fs-small);
	}

	@media (max-width: 767px) {
		.consent-banner {
			flex-wrap: wrap;
			align-items: flex-start;
			gap: var(--s-14) var(--s-10);
			padding: var(--s-16);

			> svg {
				margin-top: 1px;
			}
		}

		.consent-text {
			flex-basis: calc(100% - 32px);
		}

		.consent-button {
			flex: 1;
			font-size: var(--fs-body-s);
		}
	}
</style>
