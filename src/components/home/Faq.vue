<script setup>
	import { computed, watchEffect, onUnmounted } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { Leaf, Plus } from '@lucide/vue'
	import { applyJsonLd } from '@/utils/seo'
	import { SESSION_MINUTES, SESSION_PRICE_RON } from '@/session.config'

	const { t, tm } = useI18n()

	const sessionFacts = { minutes: SESSION_MINUTES, price: SESSION_PRICE_RON }

	// rt() returns the raw message, so answers carrying {minutes}/{price} go through t() instead.
	const items = computed(() =>
		tm('home.faq.items').map((_, index) => ({
			question: t(`home.faq.items[${index}].question`),
			answer: t(`home.faq.items[${index}].answer`, sessionFacts)
		}))
	)

	// The same Q&A the page renders, handed to search and AI engines as answerable pairs.
	watchEffect(() => {
		applyJsonLd('faq', {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: items.value.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer }
			}))
		})
	})

	onUnmounted(() => applyJsonLd('faq', null))
</script>

<template>
	<section class="stack stack-loose">
		<div class="section-head-center">
			<h2>{{ t('home.faq.title') }}</h2>
			<Leaf class="section-flourish" :size="20" />
		</div>

		<div class="card-grid home-faq-grid">
			<details v-for="item in items" :key="item.question" class="home-faq-item card-outlined">
				<summary class="home-faq-question">
					{{ item.question }}
					<Plus class="home-faq-icon" :size="18" />
				</summary>

				<p class="home-faq-answer">{{ item.answer }}</p>
			</details>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-faq-grid {
		--card-min: 20rem;
		align-items: start; // an open item grows on its own instead of stretching its row partner
		column-gap: var(--vt-c-split-gap);
	}

	.home-faq-item {
		border-radius: var(--vt-c-border-radius);
		background: var(--vt-c-surface);
	}

	.home-faq-question {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		cursor: pointer;
		list-style: none; // drops the native disclosure triangle; the icon below replaces it
		font-weight: 600;

		&::-webkit-details-marker {
			display: none;
		}
	}

	.home-faq-icon {
		flex-shrink: 0;
		color: var(--vt-c-jannafer-green);
		transition: transform var(--vt-c-transition-speed);
	}

	// the plus becomes the close cross, so no second icon is needed
	.home-faq-item[open] .home-faq-icon {
		transform: rotate(45deg);
	}

	.home-faq-answer {
		margin: 0;
		padding: 0 1.25rem 1.25rem;
	}
</style>
