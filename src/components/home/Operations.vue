<script setup>
	import { useServicesStore } from '@/stores/servicesStore'

	const servicesStore = useServicesStore()
	import { useI18n } from 'vue-i18n'

	const { t } = useI18n();
</script>

<template>
	<section class="operations layout-full">
		<div class="layout-container">
			<div class="operations-header">
				<h2>{{ t('operations.title') }}</h2>
				<i>{{ t('operations.location') }}</i>
			</div>

			<div class="operations-grid">
				<RouterLink v-for="service in servicesStore.homeServices" :key="service.id" class="operations-item"
					:to="`/services/${service.slug}`">
					<h3>{{ t(`services.${service.key}.title`) }}</h3>
				</RouterLink>
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
				text-align: center;

				h3 {
					margin: 0;
				}

				border: 1px solid var(--vt-c-jannafer-gray);

				&:hover {
					text-decoration: none;
					background: var(--vt-c-surface);
				}
			}

			@media (max-width: 1024px) {
				grid-template-columns: repeat(2, 1fr);
				gap: 2rem;


				.operations-item {
					border-radius: 1.5rem;
					min-height: 200px;
					padding: 2rem;
				}
			}

			@media (max-width: 768px) {
				.operations-grid {
					grid-template-columns: 1fr;
					gap: 1rem;
				}

				.operations-item {
					min-height: 100px;
					padding: 1rem;
				}
			}

		}
	}
</style>