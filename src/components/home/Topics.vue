<script setup>
	import { useI18n } from 'vue-i18n'

	const { t } = useI18n()
</script>

<template>
	<section class="topics">
		<h2 class="topics-title">{{ t('topics.title') }}</h2>

		<div class="topics-grid">
			<!-- Row 1 -->
			<div class="topic-card stress">
				<h3>{{ t('topics.items.stress.title') }}</h3>
				<p>{{ t('topics.items.stress.details') }}</p>
				<button>{{ t('button.findOutMore') }}</button>
			</div>
			<div class="topic-card">
				<h3>{{ t('topics.items.anxiety.title') }}</h3>
				<p>{{ t('topics.items.anxiety.details') }}</p>
				<button>{{ t('button.findOutMore') }}</button>
			</div>
			<div class="topic-image">
				<img src="https://placehold.co/1920x500" alt="Stress Management">
			</div>
			<div class="topic-card">
				<h3>{{ t('topics.items.depression.title') }}</h3>
				<p>{{ t('topics.items.depression.details') }}</p>
				<button>{{ t('button.findOutMore') }}</button>
			</div>

			<!-- Row 2 -->
			<div class="topic-card">
				<h3>{{ t('topics.items.discovery.title') }}</h3>
				<p>{{ t('topics.items.discovery.details') }}</p>
				<button>{{ t('button.findOutMore') }}</button>
			</div>
			<div class="topic-image">
				<img src="https://placehold.co/1920x500" alt="Therapy">
			</div>
			<div class="topic-card">
				<h3>{{ t('topics.items.career.title') }}</h3>
				<p>{{ t('topics.items.career.details') }}</p>
				<button>{{ t('button.findOutMore') }}</button>
			</div>
			<div class="topic-card">
				<h3>{{ t('topics.items.fertility.title') }}</h3>
				<p>{{ t('topics.items.fertility.details') }}</p>
				<button>{{ t('button.findOutMore') }}</button>
			</div>
		</div>

		<p class="topics-footer">{{ t('topics.footer') }}</p>
	</section>
</template>

<style scoped lang="scss">
	.topics {
		margin: 4rem 0;
	}

	.topics-title {
		text-align: center;
		margin-bottom: 2rem;
	}

	.topics-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		margin: 0 auto;
	}

	.topic-card {
		background: var(--vt-c-white);
		padding: 1.5rem;
		min-height: 250px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 1rem;
		border: 1px solid #eee;

		h3 {
			margin-bottom: 0.5rem;
			font-size: 1.2rem;
		}
	}

	.topic-image {
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.topics-footer {
		text-align: center;
		margin-top: 2rem;
		font-style: italic;
	}
</style>