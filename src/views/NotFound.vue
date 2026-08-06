<script setup>
	import { onMounted, onUnmounted } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight, Leaf } from '@lucide/vue'

	const { t } = useI18n()

	// Kept in the same order as navItems in Navigation.vue
	const SUGGESTED_PAGES = [
		{ key: 'about', path: '/about' },
		{ key: 'services', path: '/services' },
		{ key: 'articles', path: '/articles' },
		{ key: 'contact', path: '/contact' },
	]

	// Read before the first overwrite; no other component touches document.title
	const SITE_TITLE = document.title

	onMounted(() => {
		document.title = `${t('notFound.title')} · ${SITE_TITLE}`
	})

	onUnmounted(() => {
		document.title = SITE_TITLE
	})
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

		<nav class="not-found-suggestions" aria-labelledby="not-found-links-title">
			<h2 id="not-found-links-title" class="not-found-links-title">{{ t('notFound.linksTitle') }}</h2>

			<div class="not-found-links card-grid">
				<RouterLink v-for="page in SUGGESTED_PAGES" :key="page.path"
					class="not-found-link card card-compact card-link" :to="page.path">
					{{ t(`navigation.menu.${page.key}`) }}
					<span class="link-arrow">
						<ArrowRight :size="16" />
					</span>
				</RouterLink>
			</div>
		</nav>
	</main>
</template>

<style scoped lang="scss">
	.not-found-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(2rem, 1.5rem + 2vw, 3.5rem);
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

	.not-found-suggestions {
		width: 100%;
		max-width: 60rem;
	}

	.not-found-links-title {
		margin: 0 0 1rem;
		text-align: center;
		font-size: var(--step-card-title);
	}

	.not-found-links {
		--card-min: 12rem;
	}

	.not-found-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
</style>
