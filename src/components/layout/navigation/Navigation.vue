<script setup>
	import { RouterLink, useRoute } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ref, onMounted, onUnmounted, watch } from 'vue'
	import ThemeToggle from '@/components/common/ThemeToggle.vue'
	import LanguageToggle from '@/components/common/LanguageToggle.vue'
	import SiteSearch from '@/components/common/SiteSearch.vue'
	import { useOverlay } from '@/composables/useOverlay'
	import { services } from '@/content/services/index.js'
	import { isHiddenPath } from '@/seo.config'

	const logoUrl = import.meta.env.BASE_URL + 'logo.svg'

	const { t } = useI18n()
	const route = useRoute()
	const isScrolled = ref(false)
	const openDropdown = ref(null)
	const hamburgerRef = ref(null)
	const closeButtonRef = ref(null)

	const { isOpen: isMenuOpen, open, close } = useOverlay({ onEscape: () => closeMenu() })

	const navItems = [
		{ key: 'home', to: '/' },
		{ key: 'about', to: '/despre-mine' },
		{
			key: 'services',
			to: '/servicii',
			children: services.map(s => ({ to: `/servicii/${s.slug}`, labelKey: `services.${s.key}.title` })),
		},
		{ key: 'resources', to: '/resurse' },
		{ key: 'events', to: '/ateliere' },
		{ key: 'news', to: '/noutati' },
		{ key: 'contact', to: '/contact' },
	].filter(item => !isHiddenPath(item.to))

	const handleScroll = () => {
		isScrolled.value = window.scrollY > 0
	}

	function toggleMenu() {
		if (isMenuOpen.value) closeMenu()
		else open(closeButtonRef)
	}

	function closeMenu({ restoreFocus = true } = {}) {
		close(restoreFocus ? hamburgerRef : null)
	}

	// navigating should land the user on the new page, not back on the hamburger
	watch(() => route.path, () => {
		closeMenu({ restoreFocus: false })
		openDropdown.value = null
	})

	onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))

	onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
	<nav class="navigation" :class="{ 'is-scrolled': isScrolled }">
		<div class="nav-logo">
			<RouterLink to="/">
				<img :src="logoUrl" :alt="t('navigation.logoAlt')" width="502" height="139">
			</RouterLink>
		</div>

		<div class="nav-menu">
			<template v-for="item in navItems" :key="item.key">
				<div v-if="item.children" class="nav-dropdown-wrapper" @mouseenter="openDropdown = item.key"
					@mouseleave="openDropdown = null">
					<RouterLink :to="item.to">
						{{ t(`navigation.menu.${item.key}`) }}<svg class="chevron"
							:class="{ 'is-open': openDropdown === item.key }" xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
							stroke-linecap="round" stroke-linejoin="round">
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</RouterLink>
					<Transition name="dropdown">
						<div v-if="openDropdown === item.key" class="nav-dropdown">
							<RouterLink v-for="child in item.children" :key="child.to" :to="child.to">
								{{ t(child.labelKey) }}
							</RouterLink>
						</div>
					</Transition>
				</div>
				<RouterLink v-else :to="item.to">{{ t(`navigation.menu.${item.key}`) }}</RouterLink>
			</template>
		</div>

		<div class="nav-controls">
			<SiteSearch />
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
					<template v-for="item in navItems" :key="item.key">
						<div v-if="item.children" class="overlay-item-group">
							<RouterLink :to="item.to">{{ t(`navigation.menu.${item.key}`) }}</RouterLink>
							<div class="overlay-item-children">
								<RouterLink v-for="child in item.children" :key="child.to" :to="child.to">
									{{ t(child.labelKey) }}
								</RouterLink>
							</div>
						</div>
						<RouterLink v-else :to="item.to">{{ t(`navigation.menu.${item.key}`) }}</RouterLink>
					</template>
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
		padding: 0 var(--page-gutter);
		background: var(--nav-bg);
		transition: all var(--vt-c-transition-speed);

		&.is-scrolled {
			backdrop-filter: blur(20px);

			:root.no-gpu-blur & {
				backdrop-filter: none;
				background: var(--vt-c-background);
			}
		}
	}

	.nav-logo img {
		display: block;
		height: 2.8rem;
		width: auto;
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

	.nav-menu>a,
	.nav-dropdown-wrapper>a {
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

	.nav-dropdown-wrapper {
		position: relative;

		>a {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
		}
	}

	.chevron {
		width: 0.8rem;
		height: 0.8rem;
		flex-shrink: 0;
		transition: transform var(--vt-c-transition-speed);

		&.is-open {
			transform: rotate(180deg);
		}
	}

	.nav-dropdown {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		min-width: 14rem;
		background: var(--vt-c-background);
		border: 1px solid var(--vt-c-jannafer-gray2);
		border-radius: 0.75rem;
		box-shadow: var(--vt-c-shadow-raised);
		z-index: 100;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		a {
			padding: 0.55rem 1.25rem;
			font-size: 0.9rem;
			white-space: nowrap;
			color: var(--vt-c-black);
			text-decoration: none;
			transition: color var(--vt-c-transition-speed), background var(--vt-c-transition-speed);

			&:hover {
				background: var(--vt-c-jannafer-gray2);
				color: var(--vt-c-jannafer-green);
			}

			&.router-link-active {
				color: var(--vt-c-jannafer-green);
				font-weight: 700;
			}
		}
	}

	.dropdown-enter-active,
	.dropdown-leave-active {
		transition: opacity var(--vt-c-transition-speed) ease, transform var(--vt-c-transition-speed) ease;
	}

	.dropdown-enter-from,
	.dropdown-leave-to {
		opacity: 0;
		transform: translateX(-50%) translateY(-0.4rem);
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
			color: var(--vt-c-on-accent);
		}
	}

	.overlay-links {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: .5rem;

		a {
			font-size: 1rem;
			font-family: "Libre Baskerville", serif;
			color: var(--vt-c-jannafer-green);
			text-decoration: none;
			padding: 0.3rem 1.5rem;
			border-radius: 2rem;
			border: 1px solid transparent;
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

	.overlay-item-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.overlay-item-children {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;

		a {
			font-size: 1rem;
			font-family: inherit;
			padding: 0.2rem 1.25rem;
			opacity: 0.75;

			&:hover {
				opacity: 1;
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
		transition: opacity var(--vt-c-transition-speed) ease, transform var(--vt-c-transition-speed) ease;
	}

	.overlay-enter-from,
	.overlay-leave-to {
		opacity: 0;
		transform: translateY(-0.75rem);
	}

	// Switches at the width where the full link row stops fitting, not at the page breakpoint —
	// below ~1150px the links, logo and controls overrun the bar.
	@media (max-width: 1150px) {
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
