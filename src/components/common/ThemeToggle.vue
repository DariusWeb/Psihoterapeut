<script setup>
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

const options = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' }
]
</script>

<template>
	<div class="theme-toggle" role="group" aria-label="Color theme">
		<button
			v-for="option in options"
			:key="option.value"
			class="theme-btn"
			:class="{ active: themeStore.mode === option.value }"
			:aria-label="option.label"
			:title="option.label"
			@click="themeStore.setMode(option.value)"
		>
			<!-- Sun icon -->
			<svg v-if="option.value === 'light'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="5"/>
				<line x1="12" y1="1" x2="12" y2="3"/>
				<line x1="12" y1="21" x2="12" y2="23"/>
				<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
				<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
				<line x1="1" y1="12" x2="3" y2="12"/>
				<line x1="21" y1="12" x2="23" y2="12"/>
				<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
				<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
			</svg>
			<!-- Moon icon -->
			<svg v-else-if="option.value === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
			</svg>
			<!-- Monitor icon -->
			<svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
				<line x1="8" y1="21" x2="16" y2="21"/>
				<line x1="12" y1="17" x2="12" y2="21"/>
			</svg>
		</button>
	</div>
</template>

<style scoped lang="scss">
.theme-toggle {
	display: flex;
	align-items: center;
	gap: 0.1rem;
	background: var(--vt-c-jannafer-gray2);
	border-radius: 2rem;
	padding: 0.2rem;
}

.theme-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.8rem;
	height: 1.8rem;
	padding: 0.3rem;
	border-radius: 50%;
	border: none;
	background: transparent;
	color: var(--vt-c-black);
	cursor: pointer;
	transition: all var(--vt-c-transition-speed);

	svg {
		width: 1rem;
		height: 1rem;
	}

	&:hover {
		background: var(--vt-c-jannafer-gray2);
		color: var(--vt-c-jannafer-green);
	}

	&.active {
		background: var(--vt-c-jannafer-green);
		color: #fff;
	}
}
</style>
