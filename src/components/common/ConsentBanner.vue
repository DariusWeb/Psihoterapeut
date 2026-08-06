<script setup>
	import { useI18n } from 'vue-i18n'
	import { RouterLink } from 'vue-router'
	import {
		analyticsConsent,
		grantAnalyticsConsent,
		denyAnalyticsConsent
	} from '@/services/analytics'

	const { t } = useI18n()
</script>

<template>
	<aside v-if="analyticsConsent === null" class="consent-banner card" role="region"
		:aria-label="t('consent.title')">
		<p class="consent-text">
			{{ t('consent.body') }}
			<RouterLink to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>.
		</p>

		<div class="consent-actions">
			<button class="button-outline" @click="denyAnalyticsConsent">
				{{ t('consent.decline') }}
			</button>
			<button class="button-primary" @click="grantAnalyticsConsent">
				{{ t('consent.accept') }}
			</button>
		</div>
	</aside>
</template>

<style lang="scss" scoped>
	.consent-banner {
		position: fixed;
		inset-inline: var(--page-gutter);
		bottom: var(--page-gutter);
		z-index: 200; // the fixed header sits at 100
		max-width: var(--vt-c-container-width);
		margin-inline: auto;
		display: flex;
		align-items: center;
		gap: clamp(1rem, 0.5rem + 1.6vw, 2rem);
		padding: var(--card-padding-compact);
		box-shadow: 0 0.5rem 2rem rgb(from var(--vt-c-black) r g b / 15%);
	}

	.consent-text {
		margin: 0;
		font-size: 0.9rem;
	}

	.consent-actions {
		display: flex;
		gap: 0.75rem;
		margin-inline-start: auto;
	}

	// equal width so declining is never the visually harder option
	.consent-actions button {
		flex: 1;
		min-width: 7rem;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.consent-banner {
			flex-direction: column;
			align-items: stretch;
		}

		.consent-actions {
			margin-inline-start: 0;
		}
	}
</style>
