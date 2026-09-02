<script setup>
	import { ref, computed } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { Check, Link, Mail, Share2, X } from '@lucide/vue'
	import { useOverlay } from '@/composables/useOverlay'
	import BrandIcon from '@/components/common/BrandIcon.vue'

	const props = defineProps({
		title: { type: String, default: '' }
	})

	const { t } = useI18n()
	const url = ref('')
	const copied = ref(false)
	const closeRef = ref(null)
	const triggerRef = ref(null)

	const { isOpen, open: openOverlay, close: closeOverlay } = useOverlay({ onEscape: () => close() })

	const networks = computed(() => {
		const link = encodeURIComponent(url.value)
		const text = encodeURIComponent(props.title)

		return [
			{ key: 'whatsapp', brand: 'whatsapp', href: `https://wa.me/?text=${text}%20${link}` },
			{ key: 'facebook', brand: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
			{ key: 'linkedin', brand: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}` },
			{ key: 'email', icon: Mail, href: `mailto:?subject=${text}&body=${link}` }
		]
	})

	async function open(trigger) {
		// Read at open time: the same component can outlive a route change.
		url.value = window.location.href
		copied.value = false
		// Vue unwraps refs in templates, so this arrives as the element, not a ref.
		triggerRef.value = trigger ?? null
		await openOverlay(closeRef)
	}

	function close() {
		closeOverlay(triggerRef)
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url.value)
			copied.value = true
			setTimeout(() => (copied.value = false), 3000)
		} catch { /* no clipboard permission */ }
	}

	defineExpose({ open })
</script>

<template>
	<Teleport to="body">
		<Transition name="overlay">
			<div v-if="isOpen" class="overlay share-overlay" @click.self="close()">
				<div class="overlay-panel share-panel card" role="dialog" aria-modal="true"
					:aria-label="t('share.title')">
					<div class="share-head">
						<div class="share-head-row">
							<span class="share-mark">
								<Share2 :size="18" aria-hidden="true" />
							</span>

							<h3 class="share-title">{{ t('share.title') }}</h3>

							<button ref="closeRef" class="share-close" :aria-label="t('share.close')"
								:title="t('share.close')" @click="close()">
								<X :size="18" aria-hidden="true" />
							</button>
						</div>

						<p class="share-subtitle">{{ t('share.subtitle') }}</p>
					</div>

					<div class="share-copy">
						<input class="share-copy-field" type="text" :value="url" readonly
							:aria-label="t('share.copyLink')" @focus="$event.target.select()" />

						<button class="button button-primary button-swap share-copy-button" @click="copyLink">
							<Transition name="swap">
								<span :key="copied" class="button-swap-label">
									<component :is="copied ? Check : Link" :size="16" aria-hidden="true" />
									{{ copied ? t('share.copied') : t('share.copyLink') }}
								</span>
							</Transition>

							<span class="button-swap-sizer">
								<Link :size="16" />
								{{ t('share.copyLink') }}
							</span>
						</button>
					</div>

					<p class="share-status" role="status">{{ copied ? t('share.copied') : '' }}</p>

					<p class="share-divider"><span>{{ t('share.viaNetworks') }}</span></p>

					<div class="share-networks">
						<a v-for="network in networks" :key="network.key" class="share-network"
							:href="network.href" target="_blank" rel="noopener noreferrer">
							<BrandIcon v-if="network.brand" :name="network.brand" :size="22" />
							<component :is="network.icon" v-else :size="22" aria-hidden="true" />
							<span>{{ t(`share.${network.key}`) }}</span>
						</a>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss">
	.share-overlay {
		align-items: center;
		padding-block: 2rem;
	}

	.share-panel {
		height: fit-content;
	}

	.share-head {
		margin-bottom: var(--card-padding);
	}

	.share-head-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.share-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: var(--vt-c-jannafer-gray);
		color: var(--vt-c-jannafer-green);
	}

	.share-title {
		flex: 1;
		min-width: 0;
		margin: 0;
	}

	.share-subtitle {
		margin: 0.5rem 0 0;
		color: var(--vt-c-black-mute);
		font-size: 0.9rem;
	}

	.share-close {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 50%;
		background: var(--vt-c-jannafer-gray2);
		color: var(--vt-c-black);
		transition: background-color var(--vt-c-transition-speed), color var(--vt-c-transition-speed);

		&:hover {
			background: var(--vt-c-jannafer-green);
			color: var(--vt-c-on-accent);
		}
	}

	.share-copy {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.share-copy-field {
		flex: 1;
		min-width: 12rem;
	}

	.share-copy-button {
		flex-shrink: 0;
	}

	.share-status {
		margin: 0;
		height: 0;
		overflow: hidden;
	}

	.share-divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: var(--card-padding) 0;
		color: var(--vt-c-black-mute);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;

		&::before,
		&::after {
			content: "";
			flex: 1;
			border-top: 1px solid var(--vt-c-jannafer-gray2);
		}
	}

	.share-networks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
		gap: 0.5rem;
	}

	.share-network {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.9rem 0.5rem;
		width: auto;
		border-radius: var(--vt-c-border-radius);
		background: var(--vt-c-jannafer-gray);
		color: var(--vt-c-jannafer-green);
		font-size: 0.8rem;
		text-align: center;
		text-decoration: none;
		transition: background-color var(--vt-c-transition-speed), color var(--vt-c-transition-speed);

		&:hover {
			background: var(--vt-c-jannafer-green);
			color: var(--vt-c-on-accent);
			text-decoration: none;
		}
	}

	.overlay-enter-active,
	.overlay-leave-active {
		transition: opacity var(--vt-c-transition-speed) ease;

		.share-panel {
			transition: transform var(--vt-c-transition-speed) ease;
		}
	}

	.overlay-enter-from,
	.overlay-leave-to {
		opacity: 0;

		.share-panel {
			transform: translateY(-0.75rem);
		}
	}
</style>
