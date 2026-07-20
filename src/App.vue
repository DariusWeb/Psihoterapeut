<script setup>
	import { onMounted } from 'vue'
	import Navigation from '@/components/layout/navigation/Navigation.vue'
	import Footer from '@/components/layout/navigation/Footer.vue'
	import { useThemeStore } from '@/stores/themeStore'

	const themeStore = useThemeStore()

	onMounted(() => {
		themeStore.initTheme()
	})

	// on scrolldown add a class to header
</script>

<template>
	<header>
		<Navigation />
		<!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" /> -->
	</header>

	<RouterView v-slot="{ Component }">
		<transition :name="$route.meta.transition || 'fade'" mode="out-in">
			<component :is="Component" class="main-content layout-container" />
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
	}

	@media (min-width: 1024px) {
		.logo {
			margin: 0 2rem 0 0;
		}
	}
</style>
