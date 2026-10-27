<script setup>
	import { useI18n } from 'vue-i18n'
	import { WORK_PRINCIPLE_ICONS } from '@/content/workPrinciples'

	const { t, tm, rt } = useI18n()
</script>

<template>
	<section id="cum-lucrez" class="band">
		<h2 class="section-title">{{ t('home.work.title') }}</h2>
		<div v-reveal class="strip">
			<div v-for="(item, index) in tm('home.work.items')" :key="rt(item.title)" class="strip-item">
				<component :is="WORK_PRINCIPLE_ICONS[index]" :size="22" />
				<h3 class="text-strip-title">{{ rt(item.title) }}</h3>
				<p class="strip-text">{{ rt(item.text) }}</p>
			</div>
		</div>
		<p class="home-work-closing text-balance">{{ t('home.work.closing') }}</p>
	</section>
</template>

<style scoped lang="scss">
	.home-work-closing {
		max-width: 70ch;
		margin: 0 auto;
		text-align: center;
	}
</style>
