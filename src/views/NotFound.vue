<script setup>
	import { useI18n } from 'vue-i18n'
	import { Leaf } from '@lucide/vue'

	const { t } = useI18n()
</script>

<template>
	<main class="not-found-page">
		<section class="not-found-card card">
			<Leaf class="not-found-flourish" :size="40" />
			<h1 class="not-found-title">{{ t('notFound.title') }}</h1>
			<p class="not-found-text">{{ t('notFound.message') }}</p>

			<RouterLink class="button button-primary" to="/">
				{{ t('notFound.backToHome') }}
			</RouterLink>
		</section>
	</main>
</template>

<style scoped lang="scss">
	.not-found-page {
		display: grid;
		place-items: center;
		min-height: 40vh;
	}

	.not-found-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		max-width: 34rem;
		text-align: center;
	}

	.not-found-flourish {
		color: var(--vt-c-jannafer-green);
	}

	.not-found-title,
	.not-found-text {
		margin: 0;
	}
</style>
