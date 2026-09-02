<script setup>
	import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
	import { RouterLink, useRoute, useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ExternalLink, Search, X } from '@lucide/vue'
	import { useOverlay } from '@/composables/useOverlay'

	const { t, locale } = useI18n()
	const route = useRoute()
	const router = useRouter()

	const query = ref('')
	const activeIndex = ref(0)
	const inputRef = ref(null)
	const triggerRef = ref(null)

	const { isOpen, open: openOverlay, close: closeOverlay } = useOverlay({ onEscape: () => close() })

	// The index pulls the whole content corpus; keeping it out of the header's chunk keeps it out of boot.
	const searchApi = ref(null)

	async function ensureIndex() {
		if (searchApi.value) return
		const module = await import('@/utils/searchIndex')
		module.buildSearchIndex(router.getRoutes())
		searchApi.value = module
	}

	const dateFormat = computed(
		() => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
	)

	const formatDate = (date) => dateFormat.value.format(new Date(date))

	const results = computed(() =>
		searchApi.value ? searchApi.value.search(query.value, { t, d: formatDate }) : []
	)

	function open() {
		ensureIndex()
		openOverlay(inputRef)
	}

	function close({ restoreFocus = true } = {}) {
		if (!isOpen.value) return
		query.value = ''
		activeIndex.value = 0
		closeOverlay(restoreFocus ? triggerRef : null)
	}

	function move(step) {
		if (!results.value.length) return
		const count = results.value.length
		activeIndex.value = (activeIndex.value + step + count) % count
		nextTick(() => {
			document.querySelector(`#search-option-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' })
		})
	}

	function openActive() {
		const item = results.value[activeIndex.value]
		if (!item) return

		if (item.external) {
			window.open(item.to, '_blank', 'noopener')
			close()
		} else {
			router.push(item.to)
		}
	}

	function handleKeydown(e) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			if (isOpen.value) close()
			else open()
		}
	}

	watch(query, () => (activeIndex.value = 0))

	// navigating should land the user on the result page, not back on the search button
	watch(() => route.fullPath, () => close({ restoreFocus: false }))

	onMounted(() => window.addEventListener('keydown', handleKeydown))

	onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
	<button ref="triggerRef" class="search-toggle" :aria-label="t('search.label')" :title="t('search.label')"
		@pointerenter="ensureIndex" @focus="ensureIndex" @click="open">
		<Search :size="18" aria-hidden="true" />
	</button>

	<Teleport to="body">
		<Transition name="overlay">
			<div v-if="isOpen" class="overlay search-overlay" @click.self="close()">
				<div class="overlay-panel search-panel" role="dialog" aria-modal="true"
					:aria-label="t('search.label')">
					<div class="search-field">
						<Search class="search-field-icon" :size="18" aria-hidden="true" />

						<input ref="inputRef" v-model="query" type="search" role="combobox"
							:placeholder="t('search.placeholder')" :aria-label="t('search.label')"
							aria-controls="search-results" aria-autocomplete="list" :aria-expanded="results.length > 0"
							:aria-activedescendant="results.length ? `search-option-${activeIndex}` : undefined"
							@keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
							@keydown.enter.prevent="openActive" />

						<button class="search-close" :aria-label="t('search.close')" :title="t('search.close')"
							@click="close()">
							<X :size="18" aria-hidden="true" />
						</button>
					</div>

					<p class="search-status" aria-live="polite">
						<template v-if="query.trim().length > 1">
							{{ results.length ? t('search.resultCount', { count: results.length }) : t('search.empty', { query: query.trim() }) }}
						</template>
					</p>

					<ul v-if="results.length" id="search-results" class="search-results" role="listbox">
						<li v-for="(item, index) in results" :id="`search-option-${index}`" :key="item.type + item.to + item.title"
							class="search-result" :class="{ 'is-active': index === activeIndex }" role="option"
							:aria-selected="index === activeIndex">
							<component :is="item.external ? 'a' : RouterLink"
								v-bind="item.external
									? { href: item.to, target: '_blank', rel: 'noopener noreferrer' }
									: { to: item.to }"
								class="search-result-link">
								<span class="search-result-head">
									<span class="search-type-tag">
										<component :is="item.icon" :size="14" aria-hidden="true" />
										{{ item.label }}
									</span>

									<span class="search-result-title"><template v-if="item.titleParts">{{ item.titleParts.before
										}}<mark>{{ item.titleParts.match }}</mark>{{ item.titleParts.after
										}}</template><template v-else>{{ item.title }}</template></span>

									<ExternalLink v-if="item.external" class="search-result-external" :size="14"
										aria-hidden="true" />
								</span>

								<span v-if="item.snippet" class="search-result-snippet">{{ item.snippet.before
									}}<mark>{{ item.snippet.match }}</mark>{{ item.snippet.after }}</span>

								<span v-if="item.hint" class="search-result-hint"><span>{{ item.hint }}</span></span>
							</component>
						</li>
					</ul>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss">
	.search-toggle {
		display: flex;
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

		&:hover {
			background: var(--vt-c-jannafer-gray2);
			color: var(--vt-c-jannafer-green);
		}
	}

	.search-overlay {
		--overlay-panel-width: 40rem;
	}

	.search-panel {
		display: flex;
		flex-direction: column;
		max-height: 100%;
		padding: 1rem;
		border-radius: var(--vt-c-radius-lg);
	}

	.search-field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.search-field-icon {
		flex-shrink: 0;
		color: var(--vt-c-jannafer-green);
	}

	.search-field input {
		flex: 1;
		min-width: 0;
	}

	.search-close {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: 50%;
		background: var(--vt-c-jannafer-gray2);
		color: var(--vt-c-black);
		cursor: pointer;
		transition: all var(--vt-c-transition-speed);

		&:hover {
			background: var(--vt-c-jannafer-green);
			color: var(--vt-c-on-accent);
		}
	}

	.search-status {
		margin: 0.75rem 0 0;
		min-height: 1.2rem;
		font-size: 0.8rem;
		color: var(--vt-c-black-mute);
	}

	.search-results {
		margin: 0.25rem 0 0;
		padding: 0;
		list-style: none;
		overflow-y: auto;
		// stops the gesture chaining to the body, which open() froze — that reads as a stalled scroll
		overscroll-behavior: contain;
		contain: content;
	}

	.search-result-link {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 0.6rem;
		border-radius: var(--vt-c-border-radius);
		color: var(--vt-c-black);
		text-decoration: none;
		transition: background-color var(--vt-c-transition-speed);

		&:hover {
			text-decoration: none;
		}
	}

	.search-result:hover .search-result-link,
	.search-result.is-active .search-result-link {
		background: var(--vt-c-jannafer-gray);
	}

	.search-result-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.search-type-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
		padding: 0.15rem 0.6rem;
		border-radius: 2rem;
		background: var(--vt-c-jannafer-gray2);
		color: var(--vt-c-jannafer-green);
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.search-result-title {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		mark {
			background: none;
			color: var(--vt-c-jannafer-green);
			font-weight: 700;
			text-decoration: underline;
		}
	}

	.search-result-external {
		flex-shrink: 0;
		color: var(--vt-c-black-mute);
	}

	.search-result-snippet {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		padding-left: 0.2rem;
		font-size: 0.78rem;
		line-height: 1.4;
		color: var(--vt-c-black-mute);

		mark {
			background: var(--vt-c-jannafer-gray2);
			color: var(--vt-c-jannafer-green);
			font-weight: 600;
			border-radius: 0.15rem;
		}
	}

	// Kept in the DOM rather than display:none so screen readers always announce it.
	// Collapsed via a 0fr grid row, not max-height — max-height relayouts every row the pointer crosses.
	.search-result-hint {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		padding-left: 0.2rem;
		font-size: 0.78rem;
		color: var(--vt-c-black-mute);
		transition: grid-template-rows var(--vt-c-transition-speed), opacity var(--vt-c-transition-speed);

		> * {
			min-height: 0;
			overflow: hidden;
		}
	}

	.search-result:hover .search-result-hint,
	.search-result.is-active .search-result-hint,
	.search-result-link:focus-visible .search-result-hint {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.overlay-enter-active,
	.overlay-leave-active {
		transition: opacity var(--vt-c-transition-speed) ease;

		.search-panel {
			transition: transform var(--vt-c-transition-speed) ease;
		}
	}

	.overlay-enter-from,
	.overlay-leave-to {
		opacity: 0;

		.search-panel {
			transform: translateY(-0.75rem);
		}
	}

	@media (max-width: 640px) {
		.search-panel {
			padding-top: 1.5rem;
		}
	}
</style>
