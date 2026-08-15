<script setup>
	import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Download, ExternalLink, Lock, X } from '@lucide/vue'
	import { useFormSubmit } from '@/composables/useFormSubmit'
	import { captureEvent } from '@/services/analytics'
	import { formatPrice, priceOf, verifyPayment } from '@/services/resources'

	const props = defineProps({
		resourceKey: { type: String, default: null },
		sessionId: { type: String, default: null }
	})

	const emit = defineEmits(['close'])

	const { t, locale } = useI18n()
	const { status, captcha, submit } = useFormSubmit('/resources/checkout')

	const email = ref('')
	const acceptedTerms = ref(false)
	const acceptedDelivery = ref(false)
	const panelRef = ref(null)

	const access = ref(null)
	const verifying = ref(false)

	const isOpen = computed(() => Boolean(props.resourceKey || props.sessionId))
	const shownKey = computed(() => access.value?.resourceKey ?? props.resourceKey)
	const price = computed(() => (props.resourceKey ? priceOf(props.resourceKey) : null))

	// `inert` hands keyboard trapping to the platform instead of a hand-rolled Tab cycle
	function setBackgroundInert(inert) {
		document.querySelectorAll('header, #main, footer').forEach((el) => {
			el.toggleAttribute('inert', inert)
		})
	}

	function close() {
		document.body.style.overflow = ''
		setBackgroundInert(false)
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
		document.body.style.overflow = 'hidden'
		await nextTick()
		setBackgroundInert(true)
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

	onUnmounted(() => {
		document.body.style.overflow = ''
		setBackgroundInert(false)
	})
</script>

<template>
	<Teleport to="body">
		<Transition name="overlay">
			<div v-if="isOpen" class="checkout-overlay" @click.self="close" @keydown.esc="close">
				<div ref="panelRef" class="checkout-panel card" role="dialog" aria-modal="true" tabindex="-1"
					:aria-label="t('resources.checkout.title')">
					<button class="checkout-close" :aria-label="t('resources.checkout.close')" @click="close">
						<X :size="18" aria-hidden="true" />
					</button>

					<h2 class="card-title">
						{{ shownKey ? t(`resources.premium.${shownKey}.title`) : t('resources.checkout.title') }}
					</h2>

					<template v-if="sessionId">
						<p v-if="verifying" class="checkout-text" aria-live="polite">
							{{ t('resources.checkout.verifying') }}
						</p>

						<template v-else-if="access">
							<p class="checkout-text">{{ t('resources.checkout.readyTitle') }}</p>
							<p class="checkout-note">{{ t('resources.checkout.readyText') }}</p>

							<div class="checkout-actions">
								<a class="button button-primary" :href="access.downloadUrl">
									<Download :size="16" aria-hidden="true" />
									{{ t('resources.checkout.download') }}
								</a>

								<a class="button button-outline" :href="`${access.downloadUrl}&view=1`" target="_blank"
									rel="noopener">
									<ExternalLink :size="16" aria-hidden="true" />
									{{ t('resources.checkout.view') }}
								</a>
							</div>
						</template>

						<p v-else class="error" role="alert">{{ t('resources.checkout.failed') }}</p>
					</template>

					<form v-else class="checkout-form" @submit.prevent="pay">
						<p class="checkout-text">{{ t('resources.checkout.intro') }}</p>

						<p v-if="price" class="checkout-price">{{ formatPrice(price) }}</p>

						<label class="checkout-label" for="checkout-email">{{ t('resources.checkout.emailLabel') }}</label>
						<input id="checkout-email" v-model="email" type="email" required autocomplete="email"
							:aria-describedby="'checkout-email-hint'" />
						<p id="checkout-email-hint" class="checkout-note">{{ t('resources.checkout.emailHint') }}</p>

						<label class="checkout-consent">
							<input v-model="acceptedTerms" type="checkbox" required />
							<span>
								{{ t('resources.checkout.terms') }}
								<RouterLink to="/termeni">{{ t('resources.checkout.termsLink') }}</RouterLink>.
							</span>
						</label>

						<label class="checkout-consent">
							<input v-model="acceptedDelivery" type="checkbox" required />
							<span>{{ t('resources.checkout.withdrawal') }}</span>
						</label>

						<div ref="captcha" class="checkout-captcha"></div>

						<button type="submit" class="button-primary" :disabled="status === 'submitting'">
							{{ status === 'submitting' ? t('resources.checkout.submitting') : t('resources.checkout.submit') }}
						</button>

						<p class="checkout-note checkout-secure">
							<Lock :size="14" aria-hidden="true" />
							{{ t('resources.checkout.secure') }}
						</p>

						<p v-if="status === 'error'" class="error" role="alert">{{ t('resources.checkout.error') }}</p>
					</form>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss">
	.checkout-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: rgb(from var(--vt-c-background) r g b / 80%);
		backdrop-filter: blur(8px);

		:root.no-gpu-blur & {
			backdrop-filter: none;
		}

		display: flex;
		justify-content: center;
		padding: clamp(1rem, 8vh, 6rem) var(--page-gutter) 2rem;
		overflow-y: auto;
	}

	.checkout-panel {
		position: relative;
		width: 100%;
		max-width: 30rem;
		height: fit-content;
		background: var(--vt-c-white);
		box-shadow: var(--vt-c-shadow-raised);
	}

	.checkout-close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 50%;
		background: var(--vt-c-jannafer-gray2);

		&:hover {
			background: var(--vt-c-jannafer-green);
			color: var(--vt-c-on-accent);
		}
	}

	.checkout-form {
		display: flex;
		flex-direction: column;
	}

	.checkout-text {
		margin: 0.5rem 0 0;
	}

	.checkout-price {
		margin: 0.75rem 0 0;
		font-size: var(--step-h3);
		font-weight: 600;
		color: var(--vt-c-jannafer-green);
	}

	.checkout-label {
		margin-top: 1rem;
		font-weight: 600;
	}

	.checkout-note {
		margin: 0.35rem 0 0;
		font-size: 0.8rem;
		color: var(--vt-c-black-mute);
	}

	.checkout-consent {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-top: 0.9rem;
		font-size: 0.85rem;

		input {
			margin-top: 0.15rem;
			flex-shrink: 0;
		}
	}

	.checkout-captcha:not(:empty) {
		margin-top: 1rem;
	}

	.checkout-form button[type='submit'] {
		margin-top: 1.25rem;
		width: 100%;
	}

	.checkout-secure {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		justify-content: center;
	}

	.checkout-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;

		.button {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
			text-decoration: none;
		}
	}

	.overlay-enter-active,
	.overlay-leave-active {
		transition: opacity 0.2s ease;

		.checkout-panel {
			transition: transform 0.2s ease;
		}
	}

	.overlay-enter-from,
	.overlay-leave-to {
		opacity: 0;

		.checkout-panel {
			transform: translateY(-0.75rem);
		}
	}

	@media (max-width: 640px) {
		.checkout-overlay {
			padding: 0;
		}

		.checkout-panel {
			max-width: none;
			min-height: 100%;
			border-radius: 0;
		}
	}
</style>
