<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight, BadgeCheck } from '@lucide/vue'
	import andreeaPortrait from '@/assets/images/about/andreea-portrait.webp'

	const { t, tm, rt } = useI18n()
</script>

<template>
	<section class="band">
		<div class="split-5-7 home-journey">
			<img class="home-journey-photo" :src="andreeaPortrait" :alt="t('about.hero.photoAlt')" width="1050"
				height="700" decoding="async" loading="lazy" />
			<div class="home-journey-body">
				<h2 class="section-title">{{ t('home.about.title') }}</h2>
				<p>{{ t('home.about.text') }}</p>
				<ul class="icon-list">
					<li v-for="credential in tm('services.credentials')" :key="rt(credential)" class="icon-list-item">
						<BadgeCheck :size="17" />{{ rt(credential) }}
					</li>
				</ul>
				<RouterLink class="link-arrow" to="/despre-mine">
					{{ t('home.about.cta') }}<ArrowRight :size="17" />
				</RouterLink>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.home-journey {
		align-items: center;
	}

	.home-journey-photo {
		display: block;
		width: 100%;
		height: 460px;
		object-fit: cover;
		border-radius: var(--r-card);
		filter: var(--photo-filter);
	}

	.home-journey-body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-20);
	}

	@media (max-width: 767px) {
		.home-journey {
			gap: var(--s-24);
		}

		.home-journey-photo {
			height: 340px;
			border-radius: var(--r-block);
		}

		.home-journey-body {
			gap: var(--s-16);
		}
	}
</style>
