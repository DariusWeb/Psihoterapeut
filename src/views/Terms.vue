<script setup>
	import { computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Calendar, LifeBuoy } from '@lucide/vue'
	import LegalContents from '@/components/common/LegalContents.vue'
	import { CONTACT } from '@/contact.config'

	const { t } = useI18n()

	const SECTION_KEYS = ['purpose', 'use', 'accuracy', 'liability', 'links', 'images', 'changes', 'contact']
	const sections = computed(() => SECTION_KEYS.map((key) => ({ key, id: `terms-${key}`, title: t(`terms.${key}.title`) })))

	// Odd parts are the two emergency numbers, rendered as tap-to-call links.
	const crisisParts = computed(() => t('terms.crisis.body').split(/(112|0800 801 200)/))
</script>

<template>
	<main class="bands u-text">
		<div class="band legal-page">
			<div class="statement">
				<h1 class="statement-title">{{ t('terms.title') }}</h1>
				<p class="text-lead legal-page-intro text-pretty">{{ t('terms.intro') }}</p>
				<p class="text-small legal-page-updated"><Calendar :size="15" aria-hidden="true" />{{ t('terms.updated') }}</p>

				<aside class="crisis-note terms-crisis" role="note" aria-labelledby="terms-crisis-title">
					<span class="crisis-note-icon"><LifeBuoy :size="20" aria-hidden="true" /></span>
					<div class="crisis-note-body">
						<h2 id="terms-crisis-title" class="crisis-note-title">{{ t('terms.crisis.title') }}</h2>
						<p class="crisis-note-text text-pretty">
							<component :is="index % 2 ? 'a' : 'span'" v-for="(part, index) in crisisParts" :key="index"
								:href="index % 2 ? `tel:${part.replaceAll(' ', '')}` : null">{{ part }}</component>
						</p>
					</div>
				</aside>
			</div>

			<div class="legal-layout">
				<LegalContents class="sticky-side" :sections="sections" />

				<div class="legal-body">
					<section v-for="(section, index) in sections" :id="section.id" :key="section.key" class="legal-section"
						tabindex="-1">
						<h2 class="legal-title">
							<span class="legal-number">{{ String(index + 1).padStart(2, '0') }}</span>{{ section.title }}
						</h2>

						<ul v-if="section.key === 'use'" class="terms-list">
							<li v-for="item in 2" :key="item" class="text-pretty">{{ t(`terms.use.i${item}`) }}</li>
						</ul>
						<p v-else-if="section.key === 'contact'" class="text-pretty">
							<i18n-t keypath="terms.contact.body" tag="span" scope="global">
								<template #email><a class="text-link" :href="`mailto:${CONTACT.email}`">{{ CONTACT.email }}</a></template>
							</i18n-t> <RouterLink class="text-link" to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>.
						</p>
						<p v-else class="text-pretty">{{ t(`terms.${section.key}.body`) }}</p>
					</section>
				</div>
			</div>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	.terms-crisis {
		align-self: stretch;
		margin-top: var(--s-12);
	}

	.terms-list {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			display: flex;
			gap: var(--s-14);

			&::before {
				content: '';
				flex: none;
				width: 6px;
				height: 6px;
				margin-top: 10px;
				border-radius: 50%;
				background: var(--olive-400);
			}
		}
	}
</style>
