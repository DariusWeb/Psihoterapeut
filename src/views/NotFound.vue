<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight, BookOpen, HeartHandshake, Leaf, Mail, UserRound } from '@lucide/vue'

	const { t } = useI18n()

	// Kept in the same order as navItems in Navigation.vue
	const SUGGESTED_PAGES = [
		{ key: 'about', path: '/despre-mine', icon: UserRound },
		{ key: 'services', path: '/servicii', icon: HeartHandshake },
		{ key: 'resources', path: '/resurse', icon: BookOpen },
		{ key: 'contact', path: '/contact', icon: Mail },
	]
</script>

<template>
	<main class="bands">
		<div class="band not-found">
			<div class="statement statement-centered not-found-head">
				<div class="not-found-numeral" role="img" :aria-label="t('notFound.title')">
					<span aria-hidden="true">4</span>
					<span class="not-found-zero" aria-hidden="true"><Leaf :size="30" /></span>
					<span aria-hidden="true">4</span>
				</div>
				<h1 class="statement-title">{{ t('notFound.message') }}</h1>
				<p class="text-lead text-pretty">{{ t('notFound.lead') }}</p>
				<RouterLink class="button-primary" to="/">{{ t('notFound.backToHome') }}</RouterLink>
			</div>

			<nav class="not-found-suggestions" aria-labelledby="not-found-links-title">
				<div class="not-found-links-head">
					<h2 id="not-found-links-title" class="not-found-links-title">{{ t('notFound.linksTitle') }}</h2>
				</div>
				<div class="not-found-links">
					<RouterLink v-for="page in SUGGESTED_PAGES" :key="page.path" class="not-found-link" :to="page.path">
						<span class="not-found-link-icon"><component :is="page.icon" :size="17" aria-hidden="true" /></span>
						<span class="not-found-link-title">{{ t(`navigation.menu.${page.key}`) }}</span>
						<ArrowRight class="not-found-link-arrow" :size="16" aria-hidden="true" />
						<span class="not-found-link-text text-caption text-pretty">{{ t(`notFound.links.${page.key}`) }}</span>
					</RouterLink>
				</div>
			</nav>
		</div>
	</main>
</template>

<style scoped lang="scss">
	.not-found {
		justify-content: center;
		gap: var(--s-56);
		min-height: 560px;
	}

	.not-found-head {
		max-width: 640px;
		margin-inline: auto;
	}

	.not-found-numeral {
		display: flex;
		align-items: center;
		gap: var(--s-14);
		margin-bottom: var(--s-4);
		font-family: var(--font-serif);
		font-size: var(--fs-display);
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--numeral);
	}

	.not-found-zero {
		display: grid;
		place-items: center;
		width: 76px;
		height: 76px;
		border: 7px solid var(--numeral);
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
		transform: translateY(3px);
	}

	.not-found-suggestions {
		display: flex;
		flex-direction: column;
		gap: var(--s-20);
		width: 100%;
		max-width: 960px;
		margin-inline: auto;
	}

	.not-found-links-head {
		display: flex;
		align-items: center;
		gap: var(--s-16);

		&::before,
		&::after {
			content: '';
			flex: 1;
			height: 1px;
			background: var(--hairline);
		}
	}

	.not-found-links-title {
		margin: 0;
		font: 700 var(--fs-caption) / 1.45 var(--font-sans);
		letter-spacing: 0;
		color: var(--olive-800);
	}

	.not-found-links {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--s-12);
	}

	.not-found-link {
		display: grid;
		grid-template-columns: 32px 1fr 16px;
		gap: var(--s-10) var(--s-12);
		align-items: center;
		align-content: start;
		padding: 18px var(--s-20);
		border: 1px solid var(--line-card);
		border-radius: var(--r-row);
		background: var(--cream);
		color: var(--ink);
		transition: background-color var(--t-ui) var(--ease-out), border-color var(--t-ui) var(--ease-out);

		&:hover {
			border-color: var(--line-field);
			background: var(--paper);
			text-decoration: none;
			color: var(--ink);

			.not-found-link-arrow {
				transform: translateX(3px);
			}
		}
	}

	.not-found-link-icon {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.not-found-link-title {
		font-family: var(--font-serif);
		font-size: var(--fs-serif-s);
		line-height: 1.25;
		color: var(--olive-700);
	}

	.not-found-link-arrow {
		color: var(--olive-600);
		transition: transform var(--t-ui) var(--ease-out);
	}

	.not-found-link-text {
		grid-column: 1 / -1;
	}

	@media (max-width: 1023px) {
		.not-found-links {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 767px) {
		.not-found-links {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
