<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight } from '@lucide/vue'
	import { useServicesStore } from '@/stores/servicesStore'

	const { t } = useI18n()
	const servicesStore = useServicesStore()
</script>

<template>
	<section class="band">
		<h2 class="section-title">{{ t('services.index.title') }}</h2>
		<div v-reveal:cards class="grid-3 home-areas">
			<RouterLink v-for="service in servicesStore.homeServices" :key="service.id"
				class="paper-card paper-card-link" :to="`/servicii/${service.slug}`">
				<img class="paper-card-media" :src="service.cardImage" :alt="t(`services.${service.key}.imageAlt`)"
					width="558" height="372" decoding="async" loading="lazy" />
				<div class="paper-card-body">
					<h3 class="paper-card-title">{{ t(`services.${service.key}.title`) }}</h3>
					<p class="paper-card-text">{{ t(`services.${service.key}.hero.title`) }}</p>
					<div class="paper-card-footer">
						<span class="card-action">
							{{ t('services.index.cta') }}<span class="card-action-icon"><ArrowRight :size="17" /></span>
						</span>
					</div>
				</div>
			</RouterLink>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-areas {
		--card-media-h: 200px;

		.paper-card-body {
			gap: var(--s-12);
		}

		.paper-card-footer {
			margin-top: 0;
		}
	}

	@media (max-width: 767px) {
		.home-areas {
			--card-media-h: 180px;

			grid-template-columns: 1fr;
		}
	}
</style>
