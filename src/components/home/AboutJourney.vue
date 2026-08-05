<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Leaf } from '@lucide/vue'
	import SplitSection from '@/components/common/SplitSection.vue'

	const { t, tm, rt } = useI18n()
</script>

<template>
	<SplitSection :alt="t('home.about.imageAlt')">
		<div class="card home-journey-card">
			<h2 class="home-journey-title">{{ t('home.about.title') }}</h2>
			<hr class="rule-short" />

			<p class="home-journey-text">{{ t('home.about.text') }}</p>

			<ul class="dot-list">
				<li v-for="credential in tm('services.credentials')" :key="rt(credential)" class="dot-list-item">
					<Leaf class="dot-list-bullet" :size="16" />
					{{ rt(credential) }}
				</li>
			</ul>

			<RouterLink class="button button-primary" to="/about">{{ t('home.about.cta') }}</RouterLink>
		</div>
	</SplitSection>
</template>

<style scoped lang="scss">
	.home-journey-card {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.5rem;
		height: 100%;
	}

	.home-journey-title {
		margin: 0;
	}

	.home-journey-text {
		margin: 0;
	}
</style>
