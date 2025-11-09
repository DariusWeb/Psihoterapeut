<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ref, onMounted, onUnmounted } from 'vue'

	const { t } = useI18n();
	const isScrolled = ref(false)

	const handleScroll = () => {
		isScrolled.value = window.scrollY > 0
	}

	onMounted(() => {
		window.addEventListener('scroll', handleScroll)
	})

	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll)
	})
</script>

<template>
	<nav class="navigation" :class="{ 'is-scrolled': isScrolled }">
		<div class="nav-logo">
			<RouterLink to="/">Logo</RouterLink>
		</div>

		<div class="nav-menu">
			<RouterLink to="/">{{ t('navigation.menu.home') }}</RouterLink>
			<RouterLink to="/about">{{ t('navigation.menu.about') }}</RouterLink>
			<RouterLink to="/services">{{ t('navigation.menu.services') }}</RouterLink>
			<RouterLink to="/events">{{ t('navigation.menu.events') }}</RouterLink>
			<RouterLink to="/articles">{{ t('navigation.menu.articles') }}</RouterLink>
			<RouterLink to="/contact">{{ t('navigation.menu.contact') }}</RouterLink>
		</div>
	</nav>
</template>

<style scoped lang="scss">
	.navigation {
		width: 100%;
		position: fixed;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 4rem;
		background: #f6f7f26e;
		transition: all var(--vt-c-transition-speed);

		&.is-scrolled {
			backdrop-filter: blur(20px);
		}
	}

	.nav-menu {
		display: flex;
		gap: 1rem;
	}

	.nav-menu a {
		position: relative;
		margin: 0.8rem 0 1.2rem;
		padding: .2rem 1rem;
		border-radius: 2rem;
		border: 2px solid transparent;
		transition: var(--vt-c-transition-speed);

		&.router-link-active {
			border-color: var(--vt-c-jannafer-green);

			&:after {
				opacity: 0;
			}
		}

		&:after {
			content: "";
			position: absolute;
			bottom: -0.12rem;
			left: 1rem;
			width: 30%;
			height: 2px;
			background: var(--vt-c-jannafer-green);
			transition: var(--vt-c-transition-speed);
		}
	}

	.nav-menu a {
		&:hover {
			text-decoration: none;

			&:after {
				width: 63%;
			}
		}

		&.router-link-active {
			background: white;

			&:after {
				width: 50%;
			}
		}
	}
</style>
