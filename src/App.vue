<script setup>
	import { onMounted, watch } from 'vue'
	import { useI18n } from 'vue-i18n'
	import Navigation from '@/components/layout/navigation/Navigation.vue'
	import Footer from '@/components/layout/navigation/Footer.vue'
	import { useThemeStore } from '@/stores/themeStore'

	const themeStore = useThemeStore()
	const { locale, t } = useI18n({ useScope: 'global' })

	watch(locale, (value) => {
		document.documentElement.lang = value
	}, { immediate: true })

	// unblocks the router's scrollBehavior, which waits for the old page to finish leaving
	function releaseScroll() {
		window.dispatchEvent(new Event('page-transition-done'))
	}

	onMounted(() => {
		themeStore.initTheme()
	})

</script>

<template>
	<a class="skip-link" href="#main">{{ t('navigation.skipToContent') }}</a>

	<header>
		<Navigation />
		<!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" /> -->
	</header>

	<RouterView v-slot="{ Component }">
		<transition :name="$route.meta.transition || 'fade'" mode="out-in" @after-leave="releaseScroll">
			<component :is="Component" id="main" tabindex="-1" class="main-content layout-container" />
		</transition>
	</RouterView>

	<footer>
		<Footer />
	</footer>
</template>

<style lang="scss" scoped>
	header {
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.main-content {
		padding: 10rem 1rem 8rem;

		&.page-home {
			padding: 4rem 1rem 0;
		}

		&.contact-page {
			padding: 0 1rem 0;
		}
	}

	@media (min-width: 1024px) {
		.logo {
			margin: 0 2rem 0 0;
		}
	}
</style>
