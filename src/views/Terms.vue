<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'

	const { t } = useI18n()
</script>

<template>
	<div class="page-terms u-text">
		<h1>{{ t('terms.title') }}</h1>
		<p class="terms-updated">{{ t('terms.updated') }}</p>
		<p>{{ t('terms.intro') }}</p>

		<aside class="terms-crisis card" role="note">
			<h2 class="terms-crisis-title">{{ t('terms.crisis.title') }}</h2>
			<p>{{ t('terms.crisis.body') }}</p>
		</aside>

		<h2>{{ t('terms.purpose.title') }}</h2>
		<p>{{ t('terms.purpose.body') }}</p>

		<h2>{{ t('terms.use.title') }}</h2>
		<ul>
			<li v-for="index in 2" :key="index">{{ t(`terms.use.i${index}`) }}</li>
		</ul>

		<h2>{{ t('terms.accuracy.title') }}</h2>
		<p>{{ t('terms.accuracy.body') }}</p>

		<h2>{{ t('terms.liability.title') }}</h2>
		<p>{{ t('terms.liability.body') }}</p>

		<h2>{{ t('terms.links.title') }}</h2>
		<p>{{ t('terms.links.body') }}</p>

		<h2>{{ t('terms.changes.title') }}</h2>
		<p>{{ t('terms.changes.body') }}</p>

		<h2>{{ t('terms.contact.title') }}</h2>
		<p>
			{{ t('terms.contact.body') }}
			<RouterLink to="/privacy">{{ t('footer.info.privacy') }}</RouterLink>.
		</p>
	</div>
</template>

<style lang="scss" scoped>
	h2 {
		margin-top: 35px;
	}

	.terms-updated {
		color: var(--vt-c-black-mute);
	}

	.terms-crisis {
		margin-top: 2rem;
		border-left: 4px solid var(--vt-c-jannafer-green);
	}

	.terms-crisis-title {
		margin-top: 0;
	}
</style>
