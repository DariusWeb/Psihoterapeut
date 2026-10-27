<script setup>
	import { onMounted } from 'vue'
	import { useI18n } from 'vue-i18n'
	import Navigation from '@/components/layout/navigation/Navigation.vue'
	import Footer from '@/components/layout/navigation/Footer.vue'
	import ConsentBanner from '@/components/common/ConsentBanner.vue'
	import LiveBanner from '@/components/common/LiveBanner.vue'
	import { useThemeStore } from '@/stores/themeStore'

	const themeStore = useThemeStore()
	const { t } = useI18n({ useScope: 'global' })

	// `lang` stays "ro" from index.html: en.json still holds the Romanian copy.

	// the router's scroll and any open overlay wait for the old page to finish leaving
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
	</header>

	<RouterView v-slot="{ Component }">
		<transition :name="$route.meta.transition || 'fade'" mode="out-in" @after-leave="releaseScroll">
			<component :is="Component" :key="$route.path" v-reveal:sections id="main" tabindex="-1" class="main-content layout-container" />
		</transition>
	</RouterView>

	<Footer />

	<ConsentBanner />
	<LiveBanner />
</template>

<style lang="scss" scoped>
	header {
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid var(--stone);
		background: var(--cream);
	}

	// The sticky header sits in the flow, so its height comes off the top padding.
	.main-content {
		padding: max(0px, var(--page-pad-top) - var(--header-h)) var(--page-gutter) var(--page-pad-bottom);
	}

	.main-content.bands {
		padding: 0;
	}
</style>
