<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight, Leaf } from '@lucide/vue'
	import { useServicesStore } from '@/stores/servicesStore'

	const { t } = useI18n()
	const servicesStore = useServicesStore()
</script>

<template>
	<section class="stack stack-loose">
		<div class="section-head-center">
			<h2>{{ t('services.index.title') }}</h2>
			<Leaf class="section-flourish" :size="20" />
		</div>

		<div class="card-grid">
			<RouterLink v-for="service in servicesStore.homeServices" :key="service.id"
				class="media-card media-card-stacked card card-outlined card-link home-area-card"
				:to="`/servicii/${service.slug}`">
				<img class="media-card-media media-fade" :src="service.cardImage"
					:alt="t(`services.${service.key}.imageAlt`)" width="558" height="372" decoding="async"
					loading="lazy" />

				<div class="media-card-body">
					<h3 class="card-title">{{ t(`services.${service.key}.title`) }}</h3>
					<p class="media-card-text">{{ t(`services.${service.key}.hero.title`) }}</p>

					<span class="media-card-action link-arrow">
						{{ t('services.index.cta') }}
						<ArrowRight :size="16" />
					</span>
				</div>
			</RouterLink>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-area-card {
		padding: 0; // the media runs to the card edge, so the copy carries its own padding instead
		overflow: hidden;
	}

	// the card's overflow:hidden already rounds this corner; its own radius would show as an inset notch
	.home-area-card .media-card-media {
		border-radius: 0;
	}

	.home-area-card .media-card-body {
		gap: var(--gap-sm);
		padding: 1.5rem;
	}
</style>
