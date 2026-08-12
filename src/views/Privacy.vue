<script setup>
	import { useI18n } from 'vue-i18n'

	const { t } = useI18n()
</script>

<template>
	<div class="page-privacy u-text">
		<h1>{{ t('privacy.title') }}</h1>
		<p class="privacy-updated">{{ t('privacy.updated') }}</p>
		<p>{{ t('privacy.intro') }}</p>

		<h2>{{ t('privacy.controller.title') }}</h2>
		<p>{{ t('privacy.controller.body') }}</p>
		<p>{{ t('privacy.controller.contact') }}</p>

		<h2>{{ t('privacy.collect.title') }}</h2>
		<p>{{ t('privacy.collect.intro') }}</p>

		<h3>{{ t('privacy.collect.form.title') }}</h3>
		<p>{{ t('privacy.collect.form.body') }}</p>

		<h3>{{ t('privacy.collect.newsletter.title') }}</h3>
		<p>{{ t('privacy.collect.newsletter.body') }}</p>
		<p>{{ t('privacy.collect.newsletter.tracking') }}</p>

		<h3>{{ t('privacy.collect.analytics.title') }}</h3>
		<p>{{ t('privacy.collect.analytics.body') }}</p>
		<p>{{ t('privacy.collect.analytics.processor') }}</p>
		<p>{{ t('privacy.collect.analytics.identity') }}</p>
		<p>{{ t('privacy.collect.analytics.withdraw') }}</p>

		<h3>{{ t('privacy.collect.storage.title') }}</h3>
		<p>{{ t('privacy.collect.storage.body') }}</p>
		<ul>
			<li>{{ t('privacy.collect.storage.theme') }}</li>
			<li>{{ t('privacy.collect.storage.language') }}</li>
			<li>{{ t('privacy.collect.storage.consent') }}</li>
			<li>{{ t('privacy.collect.storage.live') }}</li>
		</ul>
		<p>{{ t('privacy.collect.storage.life') }}</p>

		<h2>{{ t('privacy.health.title') }}</h2>
		<p>{{ t('privacy.health.body') }}</p>

		<h2>{{ t('privacy.basis.title') }}</h2>
		<ul>
			<li v-for="index in 4" :key="index">{{ t(`privacy.basis.i${index}`) }}</li>
		</ul>

		<h2>{{ t('privacy.sharing.title') }}</h2>
		<p>{{ t('privacy.sharing.body') }}</p>
		<p>{{ t('privacy.sharing.note') }}</p>

		<h2>{{ t('privacy.retention.title') }}</h2>
		<ul>
			<li v-for="index in 3" :key="index">{{ t(`privacy.retention.i${index}`) }}</li>
		</ul>

		<h2>{{ t('privacy.rights.title') }}</h2>
		<p>{{ t('privacy.rights.intro') }}</p>
		<ul>
			<li v-for="index in 6" :key="index">{{ t(`privacy.rights.i${index}`) }}</li>
		</ul>
		<p>{{ t('privacy.rights.response') }}</p>
		<p>{{ t('privacy.rights.complaint') }}</p>

		<h2>{{ t('privacy.security.title') }}</h2>
		<p>{{ t('privacy.security.body') }}</p>

		<h2>{{ t('privacy.changes.title') }}</h2>
		<p>{{ t('privacy.changes.body') }}</p>
	</div>
</template>

<style lang="scss" scoped>
	h2 {
		margin-top: 35px;
	}

	h3 {
		margin-top: 1.5rem;
		font-size: 1.05rem;
	}

	.privacy-updated {
		color: var(--vt-c-black-mute);
	}
</style>
