<script setup>
	import { RouterLink, useRoute } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
	import ThemeToggle from '@/components/common/ThemeToggle.vue'
	import LanguageToggle from '@/components/common/LanguageToggle.vue'

	const { t } = useI18n()
	const route = useRoute()
	const isScrolled = ref(false)
	const isMenuOpen = ref(false)
	const hamburgerRef = ref(null)
	const closeButtonRef = ref(null)

	const handleScroll = () => {
		isScrolled.value = window.scrollY > 0
	}

	// `inert` hands keyboard trapping to the platform instead of a hand-rolled Tab cycle
	function setBackgroundInert(inert) {
		document.querySelectorAll('header, #main, footer').forEach((el) => {
			el.toggleAttribute('inert', inert)
		})
	}

	async function openMenu() {
		isMenuOpen.value = true
		document.body.style.overflow = 'hidden'
		await nextTick()
		setBackgroundInert(true)
		closeButtonRef.value?.focus()
	}

	function toggleMenu() {
		if (isMenuOpen.value) closeMenu()
		else openMenu()
	}

	function closeMenu({ restoreFocus = true } = {}) {
		if (!isMenuOpen.value) return
		isMenuOpen.value = false
		document.body.style.overflow = ''
		setBackgroundInert(false)
		if (restoreFocus) hamburgerRef.value?.focus()
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && isMenuOpen.value) {
			closeMenu()
		}
	}

	// navigating should land the user on the new page, not back on the hamburger
	watch(() => route.path, () => {
		closeMenu({ restoreFocus: false })
	})

	onMounted(() => {
		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('keydown', handleKeydown)
	})

	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll)
		window.removeEventListener('keydown', handleKeydown)
		document.body.style.overflow = ''
		setBackgroundInert(false)
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
			<RouterLink to="/news">{{ t('navigation.menu.news') }}</RouterLink>
			<RouterLink to="/contact">{{ t('navigation.menu.contact') }}</RouterLink>
		</div>

		<div class="nav-controls">
			<ThemeToggle />
			<LanguageToggle />
			<button ref="hamburgerRef" class="hamburger" @click="toggleMenu" :aria-expanded="isMenuOpen"
				aria-label="Toggle navigation menu">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
					stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>
		</div>
	</nav>

	<Teleport to="body">
		<Transition name="overlay">
			<div v-if="isMenuOpen" class="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
				<button ref="closeButtonRef" class="overlay-close" @click="closeMenu()" aria-label="Close menu">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>

				<div class="overlay-links">
					<RouterLink to="/">{{ t('navigation.menu.home') }}</RouterLink>
					<RouterLink to="/about">{{ t('navigation.menu.about') }}</RouterLink>
					<RouterLink to="/services">{{ t('navigation.menu.services') }}</RouterLink>
					<RouterLink to="/events">{{ t('navigation.menu.events') }}</RouterLink>
					<RouterLink to="/articles">{{ t('navigation.menu.articles') }}</RouterLink>
					<RouterLink to="/news">{{ t('navigation.menu.news') }}</RouterLink>
					<RouterLink to="/contact">{{ t('navigation.menu.contact') }}</RouterLink>
				</div>

				<div class="overlay-controls">
					<ThemeToggle />
					<LanguageToggle />
				</div>
			</div>
		</Transition>
	</Teleport>
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
		background: var(--nav-bg);
		transition: all var(--vt-c-transition-speed);

		&.is-scrolled {
			backdrop-filter: blur(20px);
		}
	}

	.nav-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.hamburger {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		padding: 0.4rem;
		border-radius: 50%;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--vt-c-black);
		transition: all var(--vt-c-transition-speed);

		svg {
			width: 1.3rem;
			height: 1.3rem;
		}

		&:hover {
			background: var(--vt-c-jannafer-gray2);
			color: var(--vt-c-jannafer-green);
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

		&:hover {
			text-decoration: none;

			&:after {
				width: 63%;
			}
		}

		&.router-link-active {
			background: var(--vt-c-white);

			&:after {
				width: 50%;
			}
		}
	}

	// Full-screen overlay
	.nav-overlay {
		position: fixed;
		inset: 0;
		background: var(--vt-c-background);
		z-index: 200;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3rem;
	}

	.overlay-close {
		position: absolute;
		top: 1.2rem;
		right: 1.2rem;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0.5rem;
		border-radius: 50%;
		background: var(--vt-c-jannafer-gray2);
		border: none;
		cursor: pointer;
		color: var(--vt-c-black);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--vt-c-transition-speed);

		svg {
			width: 1.2rem;
			height: 1.2rem;
		}

		&:hover {
			background: var(--vt-c-jannafer-green);
			color: #fff;
		}
	}

	.overlay-links {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;

		a {
			font-size: 1.5rem;
			font-family: "Libre Baskerville", serif;
			color: var(--vt-c-jannafer-green);
			text-decoration: none;
			padding: 0.3rem 1.5rem;
			border-radius: 2rem;
			border: 2px solid transparent;
			transition: all var(--vt-c-transition-speed);

			&.router-link-active {
				border-color: var(--vt-c-jannafer-green);
			}

			&:hover {
				text-decoration: none;
				background: var(--vt-c-jannafer-gray2);
			}
		}
	}

	.overlay-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	// Overlay transition
	.overlay-enter-active,
	.overlay-leave-active {
		transition: opacity 0.25s ease, transform 0.25s ease;
	}

	.overlay-enter-from,
	.overlay-leave-to {
		opacity: 0;
		transform: translateY(-0.75rem);
	}

	// Responsive: hide desktop links, show hamburger on mobile
	@media (max-width: 1024px) {
		.navigation {
			padding: 0 1.5rem;
		}

		.nav-menu {
			display: none;
		}

		.hamburger {
			display: flex;
		}

		// Hide toggles from the top nav bar on mobile – they're in the overlay
		.nav-controls :deep(.theme-toggle),
		.nav-controls :deep(.lang-toggle) {
			display: none;
		}
	}
</style>
