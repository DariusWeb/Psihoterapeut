<script setup>
	import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { ChevronDown } from '@lucide/vue'

	const props = defineProps({
		sections: { type: Array, required: true }, // [{ id, title }], ids of focusable elements on the page
	})

	const { t } = useI18n()
	const headingId = useId()
	const listId = useId()
	const nav = ref(null)
	const pill = ref(null)
	const sheetOpen = ref(false)
	const activeIndex = ref(0)
	let spyPausedUntil = 0

	// A section becomes current once its top rises past this line, just under the pinned header.
	const SPY_LINE_PX = 160

	function spy() {
		if (Date.now() < spyPausedUntil) return
		const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
		let index = 0
		props.sections.forEach((section, i) => {
			if (document.getElementById(section.id)?.getBoundingClientRect().top <= SPY_LINE_PX) index = i
		})
		activeIndex.value = atBottom ? props.sections.length - 1 : index
	}

	// Paused while the smooth scroll runs, so the marker goes straight to the target instead of stepping through.
	function jumpTo(index) {
		const target = document.getElementById(props.sections[index].id)
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		activeIndex.value = index
		sheetOpen.value = false
		spyPausedUntil = Date.now() + 900
		target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
		target.focus({ preventScroll: true })
	}

	function closeSheet() {
		sheetOpen.value = false
		pill.value?.focus()
	}

	function closeOnOutsideTap(event) {
		if (!nav.value?.contains(event.target)) sheetOpen.value = false
	}

	watch(sheetOpen, (open) => {
		document[open ? 'addEventListener' : 'removeEventListener']('pointerdown', closeOnOutsideTap)
	})

	onMounted(() => {
		spy()
		window.addEventListener('scroll', spy, { passive: true })
	})
	onBeforeUnmount(() => {
		window.removeEventListener('scroll', spy)
		document.removeEventListener('pointerdown', closeOnOutsideTap)
	})
</script>

<template>
	<nav ref="nav" class="legal-contents" :class="{ 'legal-contents-open': sheetOpen }" :aria-labelledby="headingId"
		@keydown.esc="sheetOpen && closeSheet()">
		<h2 :id="headingId" class="legal-contents-title">{{ t('legal.contents') }}</h2>
		<button ref="pill" type="button" class="legal-contents-pill" :aria-expanded="sheetOpen" :aria-controls="listId"
			@click="sheetOpen = !sheetOpen">
			<span class="legal-contents-pill-label">{{ t('legal.contents') }}</span>
			<span class="legal-contents-pill-current">{{ sections[activeIndex]?.title }}</span>
			<ChevronDown :size="16" aria-hidden="true" />
		</button>
		<div :id="listId" class="legal-contents-list" :style="{ '--legal-contents-index': activeIndex }">
			<a v-for="(section, index) in sections" :key="section.id" :href="`#${section.id}`"
				class="legal-contents-link" :aria-current="index === activeIndex ? 'location' : null"
				@click.prevent="jumpTo(index)">
				<span class="legal-contents-number">{{ String(index + 1).padStart(2, '0') }}</span>{{ section.title }}
			</a>
		</div>
	</nav>
</template>

<style scoped lang="scss">
	.legal-contents {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding-top: var(--legal-section-pad);
		border-top: 1px solid var(--hairline);
	}

	.legal-contents-title {
		margin: 0;
		font: 700 var(--fs-caption) / 1.45 var(--font-sans);
		letter-spacing: 0;
		color: var(--olive-800);
	}

	.legal-contents-list {
		--legal-contents-row: 34px;

		position: relative;
		display: grid;
		grid-auto-rows: var(--legal-contents-row);
		padding-left: var(--s-16);

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 1.5px;
			border-radius: var(--r-pill);
		}

		&::before {
			bottom: 0;
			background: var(--hairline);
		}

		&::after {
			height: var(--legal-contents-row);
			background: var(--olive-600);
			transform: translateY(calc(var(--legal-contents-index) * var(--legal-contents-row)));
			transition: transform var(--t-ui) var(--ease-out);
		}
	}

	.legal-contents-link {
		display: flex;
		align-items: center;
		gap: var(--s-10);
		font-size: var(--fs-small);
		line-height: 1.3;
		white-space: nowrap;
		color: var(--ink-muted);
		transition: color var(--t-color);

		&:hover,
		&[aria-current] {
			text-decoration: none;
			color: var(--olive-800);
		}

		&[aria-current] {
			font-weight: 700;
		}
	}

	.legal-contents-number {
		width: 18px;
		font-size: 12px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--olive-600);
	}

	.legal-contents-pill {
		display: none;
	}

	@media (max-width: 767px) {
		.legal-contents {
			position: sticky;
			top: calc(var(--header-h) + var(--s-8));
			z-index: 5;
			align-self: stretch;
			gap: 0;
			padding-top: 0;
			border-top: 0;
		}

		.legal-contents-title {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.legal-contents-pill,
		.legal-contents-pill:hover {
			display: flex;
			align-items: center;
			gap: var(--s-10);
			width: 100%;
			height: 44px;
			padding: 0 var(--s-16) 0 var(--s-20);
			border: 1px solid var(--line-field);
			border-radius: var(--r-pill);
			background: var(--paper);
			box-shadow: var(--shadow-hover);
			color: var(--olive-700);

			svg {
				flex: none;
				transition: transform var(--t-ui) var(--ease-in-out);
			}

			&[aria-expanded='true'] svg {
				transform: rotate(180deg);
			}
		}

		.legal-contents-pill-label {
			font-size: var(--fs-caption);
			font-weight: 700;
			color: var(--olive-800);
		}

		.legal-contents-pill-current {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			font-size: var(--fs-small);
			text-align: left;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: var(--ink-muted);
		}

		.legal-contents-list {
			--legal-contents-row: 44px;

			position: absolute;
			top: calc(100% + var(--s-8));
			inset-inline: 0;
			max-height: calc(100dvh - var(--header-h) - 76px);
			overflow-y: auto;
			padding: var(--s-8) var(--s-20);
			border: 1px solid var(--line-card);
			border-radius: var(--r-block);
			background: var(--paper);
			box-shadow: var(--shadow-panel);
			opacity: 0;
			visibility: hidden;
			transform: translateY(-4px);
			transition: opacity var(--t-color), transform var(--t-ui) var(--ease-out), visibility var(--t-color);

			&::before,
			&::after {
				display: none;
			}
		}

		.legal-contents-open .legal-contents-list {
			opacity: 1;
			visibility: visible;
			transform: none;
		}

		.legal-contents-link {
			white-space: normal;
		}
	}
</style>
