<script setup>
	import { ref } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Check, CircleAlert } from '@lucide/vue'
	import { useFormSubmit } from '@/composables/useFormSubmit'
	import { useFormErrorMessage } from '@/composables/useFormErrorMessage'
	import { captureEvent } from '@/services/analytics'

	const { t, locale } = useI18n()
	const email = ref('')
	const consent = ref(false)
	// Brevo's double opt-in records the confirmation time and IP, which is the consent proof.
	const { status, errorCode, captcha, submit } = useFormSubmit('/newsletter')
	const errorMessage = useFormErrorMessage(errorCode, 'newsletter.error')

	const handleSubmit = async () => {
		const sent = await submit({
			email: email.value,
			locale: locale.value,
			// the exact wording the visitor agreed to, stored as the consent proof
			consentText: `${t('newsletter.consent')} ${t('newsletter.consentPrivacy')} ${t('footer.info.privacy')}.`
		})

		if (!sent) return

		// no address — an analytics copy would be personal data with no basis to hold it
		captureEvent('newsletter_subscribed')

		email.value = ''
		consent.value = false
	}
</script>

<template>
	<section class="band">
		<div class="newsletter">
			<div class="newsletter-intro">
				<h2 class="section-title">{{ t('newsletter.title') }}</h2>
				<p class="newsletter-description">{{ t('newsletter.description') }}</p>
			</div>

			<form class="newsletter-form" @submit.prevent="handleSubmit">
				<div class="form-group">
					<input id="newsletter-email" v-model="email" type="email" placeholder=" " autocomplete="email" required>
					<label for="newsletter-email">{{ t('newsletter.emailPlaceholder') }}</label>
				</div>
				<div class="checkbox-field">
					<input id="newsletter-consent" v-model="consent" type="checkbox" required>
					<label for="newsletter-consent">
						{{ t('newsletter.consent') }}
						{{ t('newsletter.consentPrivacy') }}
						<RouterLink class="text-link" to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>.
					</label>
				</div>
				<button type="submit" class="button-primary newsletter-submit" :disabled="status === 'submitting'">
					{{ t('button.subscribe') }}
				</button>
				<div ref="captcha" class="newsletter-captcha"></div>
				<div v-if="status === 'success'" class="alert" role="status">
					<span class="alert-icon"><Check :size="17" /></span>
					<p class="alert-text">{{ t('newsletter.success') }}</p>
				</div>
				<div v-if="status === 'error'" class="alert alert-error" role="alert">
					<span class="alert-icon"><CircleAlert :size="17" /></span>
					<p class="alert-text">{{ errorMessage }}</p>
				</div>
			</form>
		</div>
	</section>
</template>

<style lang="scss" scoped>
	.newsletter {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--s-56);
		align-items: start;
	}

	.newsletter-intro {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
	}

	.newsletter-description {
		max-width: 44ch;
	}

	// DOM order puts consent before the button for keyboards; `order` moves the button beside the field.
	.newsletter-form {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-14) var(--s-10);
		padding: 0;
		border-radius: 0;
		background: none;

		> * {
			flex-basis: 100%;
			order: 2;
		}

		> .form-group {
			flex: 1 1 220px;
			order: 0;
			margin: 0;
		}

		> .newsletter-submit {
			flex-basis: auto;
			order: 1;
		}
	}

	// empty until a challenge actually renders, so it must not reserve space
	.newsletter-captcha:empty {
		display: none;
	}

	// Phones follow the DOM order: field, consent, then the button.
	@media (max-width: 767px) {
		.newsletter {
			grid-template-columns: 1fr;
			gap: var(--s-24);
		}

		.newsletter-form > *,
		.newsletter-form > .newsletter-submit {
			flex-basis: 100%;
			order: 0;
		}

		.newsletter-submit {
			justify-content: center;
			width: auto;
		}
	}
</style>
