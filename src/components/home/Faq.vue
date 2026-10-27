<script setup>
	import { computed, watchEffect, onUnmounted } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { RouterLink } from 'vue-router'
	import { ArrowRight, MessageCircle } from '@lucide/vue'
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
	<section id="intrebari" class="band">
		<div class="home-faq">
			<div class="sticky-side home-faq-side">
				<h2 class="section-title">{{ t('home.faq.title') }}</h2>
				<div class="help-card home-faq-help">
					<div class="help-card-head">
						<span class="help-card-icon"><MessageCircle :size="17" /></span>
						<span>{{ t('home.faq.help.title') }}</span>
						<p class="help-card-text">{{ t('home.faq.help.text') }}</p>
					</div>
					<RouterLink class="link-arrow" to="/contact">{{ t('home.faq.help.cta') }}<ArrowRight :size="17" /></RouterLink>
				</div>
			</div>

			<div class="faq-list">
				<details v-for="(item, index) in items" :key="item.question" name="home-faq" class="faq-item" :open="index === 0">
					<summary class="faq-question">{{ item.question }}<span class="faq-icon" aria-hidden="true"></span></summary>
					<p class="faq-answer">{{ item.answer }}</p>
				</details>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-faq {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
		gap: 44px;
		align-items: start;
	}

	.home-faq-side {
		display: flex;
		flex-direction: column;
		gap: var(--s-24);
	}

	.home-faq-help {
		border: 1px solid var(--line-card);
		background: var(--paper);

		.help-card-icon {
			background: var(--olive-tint);
		}
	}

	// The side wrapper dissolves so the help card can drop under the questions on phones.
	@media (max-width: 767px) {
		.home-faq {
			grid-template-columns: 1fr;
			gap: var(--s-24);
		}

		.home-faq-side {
			display: contents;
		}

		.home-faq-help {
			order: 1;
		}
	}
</style>
