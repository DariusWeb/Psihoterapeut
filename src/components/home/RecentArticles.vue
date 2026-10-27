<script setup>
	import { computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight } from '@lucide/vue'
	import { useArticlesStore } from '@/stores/articlesStore'

	const { t, locale } = useI18n()
	const articlesStore = useArticlesStore()

	// The all-articles tile fills whatever is left of the last row of three.
	const allTileSpan = computed(() => 3 - (articlesStore.homeArticles.length % 3))

	const formatDate = (date) => new Date(date).toLocaleDateString(locale.value, {
		day: 'numeric', month: 'long', year: 'numeric'
	})
</script>

<template>
	<section class="band">
		<h2 class="section-title">{{ t('home.resources.title') }}</h2>
		<div v-reveal:cards class="grid-3 home-articles">
			<RouterLink v-for="article in articlesStore.homeArticles" :key="article.id" class="paper-card paper-card-link"
				:to="`/articole/${article.slug}`">
				<img v-if="article.image" class="paper-card-media" :src="article.image" :alt="article.imageAlt ?? article.title"
					width="600" height="400" decoding="async" loading="lazy" />
				<div v-else class="paper-card-media" role="img" :aria-label="article.title"></div>
				<div class="paper-card-body">
					<p class="home-article-meta">
						<time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
						&middot;
						{{ t('resources.articles.readTime', { minutes: article.readTime }) }}
					</p>
					<h3 class="paper-card-title">{{ article.title }}</h3>
					<div class="paper-card-footer">
						<span class="card-action">
							{{ t('resources.articles.read') }}<span class="card-action-icon"><ArrowRight :size="17" /></span>
						</span>
					</div>
				</div>
			</RouterLink>
			<RouterLink class="all-tile" :style="{ '--all-tile-span': allTileSpan }" to="/articole">
				<h3 class="paper-card-title">{{ t('home.resources.allTitle') }}</h3>
				<p class="all-tile-text">{{ t('home.resources.allText') }}</p>
				<span class="card-action">
					{{ t('resources.articles.viewAll') }}<span class="card-action-icon"><ArrowRight :size="17" /></span>
				</span>
			</RouterLink>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-articles .all-tile {
		grid-column: span var(--all-tile-span);
	}

	.home-article-meta {
		font-size: var(--fs-small);
		line-height: 1.5;
		color: var(--ink-muted);
	}

	// The span counts leftovers of a 3-column row, so in the 2-column tablet grid the tile is a plain cell.
	@media (max-width: 1023px) {
		.home-articles .all-tile {
			grid-column: auto;
		}
	}

	@media (max-width: 767px) {
		.home-articles {
			grid-template-columns: 1fr;
		}
	}
</style>
