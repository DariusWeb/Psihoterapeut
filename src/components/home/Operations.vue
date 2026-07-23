<script setup>
	import { useServicesStore } from '@/stores/servicesStore'

	const servicesStore = useServicesStore()
	import { useI18n } from 'vue-i18n'

	const { t } = useI18n();

	const SERVICE_CATEGORIES = ['adults', 'adolescents', 'kids']
</script>

<template>
	<section class="operations layout-full">
		<div class="layout-container">
			<div class="operations-header">
				<h2>{{ t('operations.title') }}</h2>
				<i>{{ t('operations.location') }}</i>
			</div>

			<div class="operations-grid">
				<div class="operations-item" v-for="category in SERVICE_CATEGORIES" :key="category">
					<h3>{{ t(`operations.categoryLabels.${category}`) }}</h3>

					<div v-for="service in servicesStore.homeServices.filter(s => s.category === category)"
						:key="service.id">
						<RouterLink :to="`/services#${service.slug}`" class="operations-card">
							{{ service.title }}
						</RouterLink>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.operations {
		padding: var(--vt-c-section-padding);
		background-color: var(--vt-c-jannafer-gray);

		.operations-header {
			text-align: center;
			margin-bottom: 3rem;

			h2 {
				margin-bottom: 1rem;
			}
		}

		.operations-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 3rem;

			.operations-item {
				display: flex;
				flex-direction: column;
				justify-content: center;
				background: var(--vt-c-background);
				gap: .5rem;
				align-items: center;
				padding: 3rem;
				min-height: 350px;
				border-radius: 100%;

				h3 {
					text-transform: capitalize;
				}

				border: 1px solid var(--vt-c-jannafer-gray);
			}

		}
	}

	@media (max-width: 1024px) {
		.operations-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 2rem;
		}

		.operations-item {
			border-radius: 1.5rem !important;
			min-height: 200px !important;
		}
	}

	@media (max-width: 768px) {
		.operations-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>