<script setup>
	import { useI18n } from 'vue-i18n'
	const { t } = useI18n()
</script>

<template>
	<section class="about">
		<!-- Left side - free floating -->
		<div class="about-left">
			<div class="about-questions">
				<h2>{{ t('aboutYou.section.title') }}</h2>
				<h3>{{ t('aboutYou.section.mainQuestion') }}</h3>
				<ul>
					<li>{{ t('aboutYou.section.rhetoricalQuestions.q1') }}</li>
					<li>{{ t('aboutYou.section.rhetoricalQuestions.q2') }}</li>
					<li>{{ t('aboutYou.section.rhetoricalQuestions.q3') }}</li>
				</ul>
			</div>
		</div>

		<!-- Right side - two boxes -->
		<div class="about-right">
			<div class="step-box">
				<h3>{{ t('aboutYou.steps.step1.title') }}</h3>
				<button>{{ t('aboutYou.steps.step1.cta') }}</button>
				<p>{{ t('aboutYou.steps.step1.details') }}</p>
			</div>

			<div class="step-box">
				<h3>{{ t('aboutYou.steps.step2.title') }}</h3>
				<p>{{ t('aboutYou.steps.step2.discussion') }}</p>
				<p>{{ t('aboutYou.steps.step2.partnership') }}</p>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.about {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 3rem 0;

		.about-left {
			background-image: url('https://placehold.co/600x400');
			background-size: cover;
			background-position: center;
			padding: 3rem;
			border-radius: 100%;
			min-height: 400px;
			min-width: 400px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.about-right {
			display: flex;
			flex-direction: column;
			flex: 1;
			max-width: 50%;
			gap: 1rem;

			.step-box {
				border: 1px solid #ccc;
				padding: 1rem;
				border-radius: 8px;
			}
		}
	}
</style>