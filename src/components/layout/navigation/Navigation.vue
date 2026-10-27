<script setup>
	import { RouterLink, useRoute } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ref, watch } from 'vue'
	import { ChevronDown, Menu, Search, X } from '@lucide/vue'
	import ThemeToggle from '@/components/common/ThemeToggle.vue'
	import LanguageToggle from '@/components/common/LanguageToggle.vue'
	import SiteSearch from '@/components/common/SiteSearch.vue'
	import { afterPageLeaves, useOverlay } from '@/composables/useOverlay'
	import { services } from '@/content/services/index.js'
	import { isHiddenPath } from '@/seo.config'

	const logoUrl = import.meta.env.BASE_URL + 'logo.svg'

	const { t } = useI18n()
	const route = useRoute()
	const openDropdown = ref(null)
	const hamburgerRef = ref(null)
	const closeButtonRef = ref(null)
	const siteSearchRef = ref(null)

	const { isOpen: isMenuOpen, open, close } = useOverlay({ onEscape: () => closeMenu() })

	const navItems = [
		{ key: 'home', to: '/' },
		{ key: 'about', to: '/despre-mine' },
		{
			key: 'services',
			to: '/servicii',
			children: services.map(s => ({ to: `/servicii/${s.slug}`, key: s.key, icon: s.icon })),
		},
		{ key: 'resources', to: '/resurse' },
		{ key: 'events', to: '/ateliere' },
		{ key: 'news', to: '/noutati' },
		{ key: 'contact', to: '/contact' },
	].filter(item => !isHiddenPath(item.to))

	// Home only on an exact match; the others also mark the pages below them (a service under For you).
	const isCurrent = (item) => (item.to === '/' ? route.path === '/' : route.path.startsWith(item.to))

	function toggleMenu() {
		if (isMenuOpen.value) closeMenu()
		else open(closeButtonRef)
	}

	function toggleDropdown(key) {
		openDropdown.value = openDropdown.value === key ? null : key
	}

	// hover alone left the submenu unreachable on touch; focusout keeps the keyboard path closing
	function closeDropdownOnLeave(event, key) {
		if (openDropdown.value !== key) return
		if (!event.currentTarget.contains(event.relatedTarget)) openDropdown.value = null
	}

	function closeMenu({ restoreFocus = true } = {}) {
		close(restoreFocus ? hamburgerRef : null)
	}

	function openSearchFromMenu() {
		closeMenu({ restoreFocus: false })
		siteSearchRef.value.open()
	}

	// a link to the page already shown doesn't navigate, so it closes the menu itself
	function closeMenuIfCurrent(to) {
		if (to === route.path) closeMenu()
	}

	// navigating should land the user on the new page, not back on the hamburger
	watch(() => route.path, () => {
		openDropdown.value = null
		if (isMenuOpen.value) afterPageLeaves(() => closeMenu({ restoreFocus: false }))
	})
</script>

<template>
	<nav class="navigation">
		<div class="nav-logo">
			<RouterLink to="/">
				<img :src="logoUrl" :alt="t('navigation.logoAlt')" width="502" height="139">
			</RouterLink>
		</div>

		<div class="nav-menu">
			<template v-for="item in navItems">
				<div v-if="item.children" :key="item.key" class="nav-dropdown-wrapper"
					@mouseenter="openDropdown = item.key" @mouseleave="openDropdown = null"
					@focusout="closeDropdownOnLeave($event, item.key)">
					<span class="nav-item nav-dropdown-trigger"
						:class="{ 'is-current': isCurrent(item), 'is-open': openDropdown === item.key }">
						<RouterLink :to="item.to">
							{{ t(`navigation.menu.${item.key}`) }}
						</RouterLink>
						<button type="button" class="chevron-button" @click="toggleDropdown(item.key)"
							:aria-expanded="openDropdown === item.key"
							:aria-label="t('navigation.submenuToggle', { menu: t(`navigation.menu.${item.key}`) })">
							<ChevronDown class="chevron" :size="14" aria-hidden="true" />
						</button>
					</span>
					<Transition name="panel">
						<div v-if="openDropdown === item.key" class="nav-panel">
							<RouterLink v-for="child in item.children" :key="child.to" :to="child.to"
								class="nav-panel-item">
								<span class="nav-panel-icon"><component :is="child.icon" :size="17" aria-hidden="true" /></span>
								<span class="nav-panel-title">{{ t(`services.${child.key}.title`) }}</span>
								<span class="nav-panel-text text-caption">{{ t(`services.${child.key}.summary`) }}</span>
							</RouterLink>
						</div>
					</Transition>
				</div>
				<RouterLink v-else :key="item.key" :to="item.to" class="nav-item" :class="{ 'is-current': isCurrent(item) }">
					{{ t(`navigation.menu.${item.key}`) }}
				</RouterLink>
			</template>
		</div>

		<div class="nav-controls">
			<SiteSearch ref="siteSearchRef" />
			<ThemeToggle />
			<LanguageToggle />
			<button ref="hamburgerRef" type="button" class="menu-button hamburger" @click="toggleMenu"
				:aria-expanded="isMenuOpen" :aria-label="t('navigation.menuToggle')">
				<Menu :size="19" aria-hidden="true" />
			</button>
		</div>

		<Teleport to="body">
			<Transition name="overlay">
				<div v-if="isMenuOpen" class="nav-overlay" role="dialog" aria-modal="true" :aria-label="t('navigation.menuLabel')">
					<div class="overlay-top">
						<RouterLink to="/" class="overlay-logo" @click="closeMenuIfCurrent('/')">
							<img :src="logoUrl" :alt="t('navigation.logoAlt')" width="502" height="139">
						</RouterLink>
						<button type="button" class="overlay-search" :aria-label="t('search.label')"
							:title="t('search.label')" @click="openSearchFromMenu">
							<Search :size="18" aria-hidden="true" />
						</button>
						<button ref="closeButtonRef" type="button" class="menu-button" @click="closeMenu()"
							:aria-label="t('navigation.menuClose')">
							<X :size="19" aria-hidden="true" />
						</button>
					</div>

					<div class="overlay-links">
						<div v-for="(item, index) in navItems" :key="item.key" class="overlay-item menu-rise"
							:style="{ '--rise-index': Math.min(index, 5) }">
							<RouterLink :to="item.to" class="overlay-link" :class="{ 'is-current': isCurrent(item) }"
								@click="closeMenuIfCurrent(item.to)">
								{{ t(`navigation.menu.${item.key}`) }}
							</RouterLink>
							<div v-if="item.children" class="overlay-sublinks">
								<RouterLink v-for="child in item.children" :key="child.to" :to="child.to" class="overlay-sublink"
									@click="closeMenuIfCurrent(child.to)">
									{{ t(`services.${child.key}.title`) }}
								</RouterLink>
							</div>
						</div>
					</div>

					<div class="overlay-footer menu-rise" style="--rise-index: 5">
						<RouterLink to="/programare" class="button-primary overlay-book"
							@click="closeMenuIfCurrent('/programare')">{{ t('navigation.cta.book') }}</RouterLink>
						<div class="overlay-controls">
							<ThemeToggle />
							<LanguageToggle />
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</nav>
</template>

<style scoped lang="scss">
	// The bar's ground and line sit on App's <header>; this is the container inside it.
	.navigation {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--s-24);
		max-width: var(--container);
		height: var(--header-h);
		margin-inline: auto;
		padding: 0 var(--gutter);
	}

	.nav-logo {
		flex: 1;
		display: flex;

		img {
			display: block;
			height: 40px;
			width: auto;
		}
	}

	.nav-menu {
		display: flex;
		gap: var(--s-4);
	}

	.nav-controls {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--s-10);
	}

	.nav-menu a {
		text-decoration: none;
	}

	.nav-item {
		position: relative;
		display: flex;
		align-items: center;
		height: var(--control-h);
		padding: 0 var(--s-14);
		font: 500 var(--fs-body-s) var(--font-sans);
		white-space: nowrap;
		color: var(--ink);
		transition: color var(--t-color);

		&::after {
			content: '';
			position: absolute;
			left: var(--s-14);
			right: var(--s-14);
			bottom: 3px;
			height: 1.5px;
			border-radius: var(--r-pill);
			background: var(--olive-400);
			transform: scaleX(0);
			transition: transform var(--t-ui) var(--ease-out);
		}

		&:hover,
		&.is-open {
			color: var(--olive-700);

			&::after {
				transform: scaleX(1);
			}
		}

		&.is-current {
			color: var(--olive-800);

			&::after {
				height: 2px;
				background: var(--olive-600);
				transform: scaleX(1);
			}
		}
	}

	// The panel centres on the header, not on this item, so the wrapper stays unpositioned.
	.nav-dropdown-wrapper {
		display: flex;
	}

	.nav-dropdown-trigger {
		padding: 0;

		> a {
			display: flex;
			align-items: center;
			align-self: stretch;
			padding-left: var(--s-14);
			color: inherit;
		}
	}

	// the chevron is its own control so touch and keyboard can open the submenu; the link navigates
	.chevron-button {
		display: flex;
		align-items: center;
		align-self: stretch;
		padding: 0 var(--s-14) 0 var(--s-4);
		background: transparent;
		color: inherit;

		&:hover {
			background: transparent;
			color: inherit;
		}
	}

	.chevron {
		transition: transform var(--t-color);

		.is-open & {
			transform: rotate(180deg);
		}
	}

	.nav-panel {
		position: absolute;
		top: calc(var(--header-h) + var(--s-4));
		left: calc(50% - 330px);
		z-index: 100;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--s-4);
		width: 660px;
		padding: var(--s-10);
		border-radius: var(--r-block);
		background: var(--paper);
		box-shadow: var(--shadow-panel);
		transform-origin: top center;
		white-space: normal;

		// Bridges the gap down from the link, so moving the pointer into the panel doesn't close it.
		&::before {
			content: '';
			position: absolute;
			bottom: 100%;
			left: 0;
			right: 0;
			height: calc((var(--header-h) - var(--control-h)) / 2 + var(--s-4));
		}
	}

	.nav-panel-item {
		display: grid;
		grid-template-columns: 32px minmax(0, 1fr);
		gap: var(--s-10) var(--s-12);
		align-items: center;
		padding: var(--s-16);
		border-radius: var(--r-item);
		color: var(--ink);
		transition: background-color var(--t-color);

		&:hover {
			background: var(--sand);
			color: var(--ink);
		}
	}

	.nav-panel-icon {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--olive-600) 7%, transparent);
		color: var(--olive-600);
	}

	.nav-panel-title {
		font-family: var(--font-serif);
		font-size: var(--fs-serif-s);
		line-height: 1.25;
		color: var(--olive-700);
	}

	.nav-panel-text {
		grid-column: 1 / -1;
	}

	.panel-enter-active,
	.panel-leave-active {
		transition: opacity var(--t-color) var(--ease-out), transform var(--t-color) var(--ease-out);
	}

	.panel-enter-from,
	.panel-leave-to {
		opacity: 0;
		transform: translateY(-4px) scale(0.98);
	}

	.menu-button {
		display: grid;
		place-items: center;
		flex: none;
		width: var(--control-h);
		height: var(--control-h);
		padding: 0;
		border: 1.5px solid var(--olive-200);
		border-radius: var(--r-pill);
		background: var(--paper);
		color: var(--olive-700);
		transition: border-color var(--t-color);

		&:hover {
			border-color: var(--olive-600);
			background: var(--paper);
			color: var(--olive-700);
		}
	}

	.hamburger {
		display: none;
	}

	.nav-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		padding: var(--s-10) var(--gutter) var(--s-24);
		overflow-y: auto;
		background: var(--cream);
	}

	// Same height and line as the bar it covers, so the logo and the button don't jump.
	.overlay-top {
		flex: none;
		display: flex;
		align-items: center;
		gap: var(--s-4);
		height: calc(var(--header-h) - 2 * var(--s-10));
	}

	.overlay-logo {
		margin-right: auto;
	}

	.overlay-logo img {
		display: block;
		height: 40px;
		width: auto;
	}

	.overlay-links {
		display: flex;
		flex-direction: column;
		margin-top: 30px;
		padding-bottom: var(--s-24);
	}

	.overlay-item {
		display: flex;
		flex-direction: column;
	}

	.overlay-link {
		position: relative;
		display: flex;
		align-items: center;
		min-height: 44px;
		padding-left: var(--s-16);
		font: 24px / 1.3 var(--font-serif);
		color: var(--olive-700);

		&:hover {
			text-decoration: none;
			color: var(--olive-800);
		}

		&.is-current {
			color: var(--olive-800);

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: calc(50% - 3px);
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: var(--olive-600);
			}
		}
	}

	.overlay-sublinks {
		display: flex;
		flex-direction: column;
		margin: 0 0 var(--s-6) var(--s-16);
		padding-left: var(--s-14);
		border-left: 1.5px solid var(--olive-200);
	}

	.overlay-sublink {
		display: flex;
		align-items: center;
		min-height: var(--control-h);
		font-size: var(--fs-body-s);
		color: var(--ink);

		&:hover {
			text-decoration: none;
			color: var(--olive-800);
		}

		&[aria-current='page'] {
			font-weight: 700;
			color: var(--olive-800);
		}
	}

	.overlay-footer {
		display: flex;
		flex-direction: column;
		gap: var(--s-14);
		margin-top: auto;
	}

	// Same look and spot as the header's search button, so it doesn't jump when the menu opens.
	.overlay-search {
		display: grid;
		place-items: center;
		width: var(--control-h);
		height: var(--control-h);
		padding: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--olive-700);
		transition: background-color var(--t-color);

		&:hover {
			background: var(--olive-tint);
			color: var(--olive-700);
		}
	}

	.overlay-book {
		justify-content: center;
		width: 100%;
		height: 44px;
	}

	.overlay-controls {
		display: flex;
		justify-content: space-between;

		:deep(.theme-toggle) {
			--toggle-w: 38px;
			--toggle-h: 38px;

			svg {
				width: 16px;
				height: 16px;
			}
		}

		:deep(.lang-toggle) {
			--toggle-w: 44px;
			--toggle-h: 38px;

			.toggle-option {
				font-size: 12px;
				font-weight: 700;
			}
		}
	}

	.menu-rise {
		animation: menu-rise var(--t-ui) var(--ease-out) backwards;
		animation-delay: calc(var(--rise-index) * 40ms + 60ms);
	}

	@keyframes menu-rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}

	.overlay-enter-active,
	.overlay-leave-active {
		transition: opacity var(--t-color) var(--ease-out);
	}

	.overlay-enter-from,
	.overlay-leave-to {
		opacity: 0;
	}

	// Switches where the link row stops fitting, not at the page breakpoint.
	@media (max-width: 1150px) {
		.nav-menu {
			display: none;
		}

		.hamburger {
			display: grid;
		}

		.nav-controls {
			gap: var(--s-4);
		}

		// the toggles live in the menu below this width
		.nav-controls :deep(.theme-toggle),
		.nav-controls :deep(.lang-toggle) {
			display: none;
		}
	}

	// The circle's icon lines up with the gutter, not its edge.
	@media (max-width: 767px) {
		.navigation,
		.nav-overlay {
			padding-right: var(--s-12);
		}
	}
</style>
