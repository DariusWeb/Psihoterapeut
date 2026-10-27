<script setup>
	import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

	const props = defineProps({
		label: { type: String, required: true },
		options: { type: Array, required: true }, // [{ value, label }]
	})
	const model = defineModel({ required: true })

	const labelId = useId()
	const track = ref(null)
	const optionEls = []
	const thumbStyle = ref(null)
	let resizeObserver

	const activeIndex = () => props.options.findIndex((option) => option.value === model.value)

	function placeThumb() {
		const active = optionEls[activeIndex()]
		if (!active) return
		thumbStyle.value = { width: `${active.offsetWidth}px`, transform: `translateX(${active.offsetLeft}px)` }
	}

	function moveWithArrows(event, index) {
		const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
		if (!step) return
		event.preventDefault()
		const next = (index + step + props.options.length) % props.options.length
		model.value = props.options[next].value
		optionEls[next].focus()
	}

	watch(model, placeThumb, { flush: 'post' })

	// Font loading and a locale switch both change the option widths.
	onMounted(() => {
		resizeObserver = new ResizeObserver(placeThumb)
		resizeObserver.observe(track.value)
	})
	onBeforeUnmount(() => resizeObserver.disconnect())
</script>

<template>
	<div class="segmented">
		<span :id="labelId" class="segmented-label">{{ label }}</span>
		<div ref="track" role="radiogroup" :aria-labelledby="labelId" class="segmented-track">
			<span v-if="thumbStyle" class="segmented-thumb" :style="thumbStyle"></span>
			<button v-for="(option, index) in options" :key="option.value" :ref="(el) => (optionEls[index] = el)"
				type="button" role="radio" class="segmented-option" :aria-checked="option.value === model"
				:tabindex="option.value === model ? 0 : -1" @click="model = option.value"
				@keydown="moveWithArrows($event, index)">
				{{ option.label }}
			</button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.segmented {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-8);
	}

	.segmented-label {
		font-size: var(--fs-caption);
		font-weight: 700;
		line-height: 1.45;
		color: var(--olive-800);
	}

	.segmented-track {
		position: relative;
		display: flex;
		padding: 3px;
		border-radius: var(--r-pill);
		background: var(--stone);
	}

	// Inserted already placed, so it slides between options but never in from zero on load.
	.segmented-thumb {
		position: absolute;
		inset-block: 3px;
		left: 0;
		border-radius: var(--r-pill);
		background: var(--thumb);
		box-shadow: var(--shadow-thumb);
		transition: transform var(--t-ui) var(--ease-in-out), width var(--t-ui) var(--ease-in-out);
	}

	.segmented-option {
		position: relative;
		height: calc(var(--control-h) - 6px);
		padding: 0 var(--segmented-pad, var(--s-24));
		border-radius: var(--r-pill);
		background: transparent;
		font: 600 var(--fs-small) var(--font-sans);
		white-space: nowrap;
		color: var(--ink-soft);
		transition: color var(--t-color);

		&:hover {
			background: transparent;
			color: var(--ink-soft);
		}

		&[aria-checked='true'] {
			color: var(--olive-800);
		}
	}

	@media (max-width: 767px) {
		.segmented {
			align-items: stretch;
		}

		.segmented-track {
			display: grid;
			grid-auto-columns: minmax(0, 1fr);
			grid-auto-flow: column;
		}

		.segmented-option {
			width: 100%;
			padding: 0 var(--s-4);
			line-height: 1.2;
			white-space: normal;
		}
	}
</style>
