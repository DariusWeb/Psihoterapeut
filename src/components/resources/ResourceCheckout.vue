<script setup>
	import { computed, nextTick, onMounted, ref, watch } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Check, CircleAlert, Download, ExternalLink, LoaderCircle, Lock, X } from '@lucide/vue'
	import { useFormSubmit } from '@/composables/useFormSubmit'
	import { useFormErrorMessage } from '@/composables/useFormErrorMessage'
	import { useOverlay } from '@/composables/useOverlay'
	import { captureEvent } from '@/services/analytics'
	import { formatPrice, priceOf, verifyPayment } from '@/services/resources'

	const props = defineProps({
		resourceKey: { type: String, default: null },
		sessionId: { type: String, default: null }
	})

	const emit = defineEmits(['close'])

	const { t, locale } = useI18n()
	const { status, errorCode, captcha, submit } = useFormSubmit('/resources/checkout')
	const errorMessage = useFormErrorMessage(errorCode, 'resources.checkout.error')

	const email = ref('')
	const acceptedTerms = ref(false)
	const acceptedDelivery = ref(false)
	const panelRef = ref(null)

	const access = ref(null)
	const verifying = ref(false)

	const isOpen = computed(() => Boolean(props.resourceKey || props.sessionId))
	const shownKey = computed(() => access.value?.resourceKey ?? props.resourceKey)
	const price = computed(() => (props.resourceKey ? priceOf(props.resourceKey) : null))

	// The panel's open state is the parent's to own, so only the page lock is taken here.
	const { hold, release } = useOverlay()

	function close() {
		release()
		emit('close')
	}

	async function pay() {
		captureEvent('resource_checkout_started', { resource: props.resourceKey })

		const result = await submit({
			resourceKey: props.resourceKey,
			email: email.value,
			locale: locale.value,
			consentText: `${t('resources.checkout.terms')} ${t('resources.checkout.termsLink')}. ${t('resources.checkout.withdrawal')}`
		})

		// A full navigation, not router.push: the next page is Stripe's.
		if (result?.url) window.location.href = result.url
	}

	async function openPanel() {
		hold()
		await nextTick()
		panelRef.value?.focus()

		if (!props.sessionId) return

		verifying.value = true
		access.value = await verifyPayment(props.sessionId)
		verifying.value = false

		if (access.value) captureEvent('resource_purchased', { resource: access.value.resourceKey })
	}

	watch(isOpen, (open) => open && openPanel())

	// Returning from Stripe opens the panel on the first render, before the watcher can fire.
	onMounted(() => isOpen.value && openPanel())
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="isOpen" class="modal" @click.self="close" @keydown.esc="close">
				<div ref="panelRef" class="modal-panel" role="dialog" aria-modal="true" tabindex="-1"
					:aria-label="t('resources.checkout.title')">
					<button type="button" class="modal-close" :aria-label="t('resources.checkout.close')" @click="close">
						<X :size="16" aria-hidden="true" />
					</button>

					<h2 class="text-pretty">
						{{ shownKey ? t(`resources.premium.${shownKey}.title`) : t('resources.checkout.title') }}
					</h2>

					<template v-if="sessionId">
						<p v-if="verifying" class="status-line" aria-live="polite">
							<LoaderCircle :size="14" class="button-spinner" aria-hidden="true" />
							{{ t('resources.checkout.verifying') }}
						</p>

						<template v-else-if="access">
							<div class="alert" role="status">
								<span class="alert-icon"><Check :size="17" /></span>
								<div class="checkout-ready">
									<b>{{ t('resources.checkout.readyTitle') }}</b>
									<p>{{ t('resources.checkout.readyText') }}</p>
								</div>
							</div>

							<div class="actions checkout-actions">
								<a class="button-primary" :href="access.downloadUrl">
									<Download :size="16" aria-hidden="true" />
									{{ t('resources.checkout.download') }}
								</a>
								<a class="button-outline" :href="`${access.downloadUrl}&view=1`" target="_blank" rel="noopener">
									<ExternalLink :size="16" aria-hidden="true" />
									{{ t('resources.checkout.view') }}
								</a>
							</div>
						</template>

						<div v-else class="alert alert-error" role="alert">
							<span class="alert-icon"><CircleAlert :size="17" /></span>
							<p class="alert-text">{{ t('resources.checkout.failed') }}</p>
						</div>
					</template>

					<form v-else class="checkout-form" @submit.prevent="pay">
						<p class="text-pretty">{{ t('resources.checkout.intro') }}</p>

						<p v-if="price" class="checkout-price">{{ formatPrice(price) }}</p>

						<div class="checkout-email">
							<div class="form-group">
								<input id="checkout-email" v-model="email" type="email" required autocomplete="email"
									placeholder=" " aria-describedby="checkout-email-hint" />
								<label for="checkout-email">{{ t('resources.checkout.emailLabel') }}</label>
							</div>
							<p id="checkout-email-hint" class="checkout-hint">{{ t('resources.checkout.emailHint') }}</p>
						</div>

						<div class="checkbox-field">
							<input id="checkout-terms" v-model="acceptedTerms" type="checkbox" required />
							<label for="checkout-terms">
								{{ t('resources.checkout.terms') }}
								<RouterLink class="text-link" to="/termeni">{{ t('resources.checkout.termsLink') }}</RouterLink>.
							</label>
						</div>

						<div class="checkbox-field">
							<input id="checkout-delivery" v-model="acceptedDelivery" type="checkbox" required />
							<label for="checkout-delivery">{{ t('resources.checkout.withdrawal') }}</label>
						</div>

						<div ref="captcha" class="checkout-captcha"></div>

						<button type="submit" class="button-primary button-full checkout-submit"
							:aria-busy="status === 'submitting'" :disabled="status === 'submitting'">
							<LoaderCircle v-if="status === 'submitting'" :size="16" class="button-spinner" aria-hidden="true" />
							{{ status === 'submitting' ? t('resources.checkout.submitting') : t('resources.checkout.submit') }}
						</button>

						<p class="form-note">
							<Lock :size="14" aria-hidden="true" />
							{{ t('resources.checkout.secure') }}
						</p>

						<div v-if="status === 'error'" class="alert alert-error" role="alert">
							<span class="alert-icon"><CircleAlert :size="17" /></span>
							<p class="alert-text">{{ errorMessage }}</p>
						</div>
					</form>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss">
	.checkout-form {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
		padding: 0;
		border-radius: 0;
		background: none;

		.form-group {
			margin: 0;
		}
	}

	.checkout-price {
		font-family: var(--font-serif);
		font-size: 28px;
		line-height: var(--lh-h2);
		color: var(--olive-700);
	}

	.checkout-email {
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	.checkout-hint {
		padding-left: var(--s-20);
		font-size: var(--fs-caption);
		line-height: 1.5;
		color: var(--ink-muted);
	}

	.checkout-captcha:empty {
		display: none;
	}

	.checkout-submit {
		margin-top: var(--s-4);
	}

	.checkout-ready {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding-top: 3px;
		color: var(--olive-800);

		b {
			font-size: var(--fs-body-s);
		}

		p {
			font-size: var(--fs-small);
			line-height: 1.55;
		}
	}

	.checkout-actions {
		gap: var(--s-10);

		a {
			gap: var(--s-8);
		}
	}
</style>
