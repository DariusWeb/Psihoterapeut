<script setup>
	import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
	import { RouterLink, useRoute, useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { ArrowRight, ExternalLink, MessageCircle, Search, X } from '@lucide/vue'
	import { afterPageLeaves, useOverlay } from '@/composables/useOverlay'

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

	const isSearching = computed(() => query.value.trim().length > 1)

	const rows = computed(() => {
		if (!searchApi.value) return []
		const context = { t, d: formatDate }
		return isSearching.value ? searchApi.value.search(query.value, context) : searchApi.value.suggestions(context)
	})

	const isEmpty = computed(() => isSearching.value && searchApi.value && !rows.value.length)

	const statusText = computed(() =>
		isSearching.value ? t('search.resultCount', { count: rows.value.length }) : t('search.suggestions')
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
		if (!rows.value.length) return
		const count = rows.value.length
		activeIndex.value = (activeIndex.value + step + count) % count
		nextTick(() => {
			document.querySelector(`#search-option-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' })
		})
	}

	function openActive() {
		const item = rows.value[activeIndex.value]
		if (!item) return

		if (item.external) {
			window.open(item.to, '_blank', 'noopener')
			close()
		} else {
			router.push(item.to)
		}
	}

	const isTyping = (el) => el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable)

	function handleKeydown(e) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			if (isOpen.value) close()
			else open()
		} else if (e.key === '/' && !isOpen.value && !isTyping(document.activeElement)) {
			e.preventDefault()
			open()
		}
	}

	watch(query, () => (activeIndex.value = 0))

	// navigating should land the user on the result page, not back on the search button
	watch(() => [route.path, route.fullPath], ([path], [oldPath]) => {
		const closeOnResult = () => close({ restoreFocus: false })
		if (path === oldPath) closeOnResult()
		else afterPageLeaves(closeOnResult)
	})

	onMounted(() => window.addEventListener('keydown', handleKeydown))

	onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

	// The mobile menu's search button opens this same page.
	defineExpose({ open })
</script>

<template>
	<div class="site-search">
		<button ref="triggerRef" type="button" class="search-toggle" :aria-label="t('search.label')"
			:title="t('search.label')" @pointerenter="ensureIndex" @focus="ensureIndex" @click="open">
			<Search :size="18" aria-hidden="true" />
		</button>

		<Teleport to="body">
			<Transition name="search">
				<div v-if="isOpen" class="search-page" role="dialog" aria-modal="true" :aria-label="t('search.label')">
					<button type="button" class="icon-button search-close" :aria-label="t('search.close')"
						:title="t('search.close')" @click="close()">
						<X :size="18" aria-hidden="true" />
					</button>

					<div class="search-column">
						<label for="site-search-input" class="text-label">{{ t('search.prompt') }}</label>

						<input id="site-search-input" ref="inputRef" v-model="query" type="search" role="combobox"
							autocomplete="off" class="search-input" :placeholder="t('search.label')"
							aria-controls="search-results" aria-autocomplete="list" :aria-expanded="rows.length > 0"
							:aria-activedescendant="rows.length ? `search-option-${activeIndex}` : undefined"
							@keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
							@keydown.enter.prevent="openActive" />

						<p class="search-status" role="status">{{ statusText }}</p>

						<ul v-if="rows.length" id="search-results" class="search-results" role="listbox"
							:aria-label="statusText">
							<li v-for="(item, index) in rows" :id="`search-option-${index}`" :key="item.type + item.to + item.title"
								class="search-result" :class="{ 'is-active': index === activeIndex }" role="option"
								:aria-selected="index === activeIndex" @mousemove="activeIndex = index">
								<component :is="item.external ? 'a' : RouterLink"
									v-bind="item.external
										? { href: item.to, target: '_blank', rel: 'noopener noreferrer' }
										: { to: item.to }"
									class="search-result-link">
									<span class="search-result-type">{{ item.label }}</span>

									<span class="search-result-body">
										<span class="search-result-title"><template v-if="item.titleParts">{{ item.titleParts.before
											}}<mark>{{ item.titleParts.match }}</mark>{{ item.titleParts.after
											}}</template><template v-else>{{ item.title }}</template></span>

										<span v-if="item.snippet" class="search-result-excerpt">{{ item.snippet.before
											}}<mark>{{ item.snippet.match }}</mark>{{ item.snippet.after }}</span>
										<span v-else-if="item.hint" class="search-result-excerpt">{{ item.hint }}</span>
									</span>

									<component :is="item.external ? ExternalLink : ArrowRight" class="search-result-arrow"
										:size="17" aria-hidden="true" />
								</component>
							</li>
						</ul>

						<div v-else-if="isEmpty" class="help-card">
							<div class="help-card-head">
								<span class="help-card-icon"><MessageCircle :size="17" aria-hidden="true" /></span>
								<span>{{ t('search.empty', { query: query.trim() }) }}</span>
								<p class="help-card-text">{{ t('search.emptyText') }}</p>
							</div>
							<RouterLink to="/contact" class="link-arrow">{{ t('search.emptyLink') }}<ArrowRight :size="17" /></RouterLink>
						</div>
					</div>

					<div class="search-keys" aria-hidden="true">
						<span><kbd>↑ ↓</kbd>{{ t('search.keys.navigate') }}</span>
						<span><kbd>↵</kbd>{{ t('search.keys.open') }}</span>
						<span><kbd>esc</kbd>{{ t('search.keys.close') }}</span>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<style scoped lang="scss">
	.search-toggle {
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

	.search-page {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
		overscroll-behavior: contain;
		background: var(--cream);
	}

	.search-close {
		position: absolute;
		top: var(--s-24);
		right: var(--s-24);
	}

	.search-column {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--s-20);
		width: 100%;
		max-width: 640px;
		padding: var(--s-64) var(--s-24) 0;
	}

	.search-input,
	.search-input:focus {
		width: 100%;
		height: auto;
		padding: 0 0 var(--s-12);
		border: 0;
		border-bottom: 1.5px solid var(--olive-600);
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		font-family: var(--font-serif);
		font-size: var(--fs-h1);
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--ink);
	}

	.search-input::placeholder {
		color: var(--label);
	}

	.search-input::-webkit-search-cancel-button {
		appearance: none;
	}

	.search-status {
		font-size: var(--fs-small);
		line-height: 1.5;
		color: var(--ink-muted);
	}

	.search-results {
		display: flex;
		flex-direction: column;
		padding: 0;
		border-top: 1px solid var(--hairline);
		list-style: none;
	}

	.search-result-link {
		display: grid;
		grid-template-columns: 88px minmax(0, 1fr) 20px;
		gap: var(--s-16);
		align-items: start;
		padding: var(--s-14) 0;
		border-bottom: 1px solid var(--hairline);
		color: var(--ink);

		&:hover {
			color: var(--ink);
			text-decoration: none;
		}
	}

	.search-result-type {
		padding-top: 3px;
		font-size: var(--fs-caption);
		line-height: 1.45;
		color: var(--ink-muted);
	}

	.search-result-body {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.search-result-title {
		font-family: var(--font-serif);
		font-size: var(--fs-h4);
		line-height: var(--lh-h4);
		color: var(--olive-700);
		transition: color var(--t-color);

		.is-active & {
			color: var(--olive-800);
		}
	}

	.search-result-excerpt {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		font-size: var(--fs-small);
		line-height: 1.5;
		color: var(--ink-muted);
	}

	mark {
		border-radius: 3px;
		background: var(--olive-tint);
		color: inherit;
	}

	.search-result-arrow {
		margin-top: var(--s-4);
		color: var(--olive-600);
		opacity: 0;
		transform: translateX(-6px);
		transition: opacity var(--t-color), transform var(--t-ui) var(--ease-out);

		.is-active & {
			opacity: 1;
			transform: none;
		}
	}

	// In the flow, pushed to the bottom: a long result list scrolls past it instead of under it.
	.search-keys {
		margin-top: auto;
		padding: var(--s-24) 0 var(--s-20);
		display: flex;
		gap: var(--s-20);
		font-size: 12px;
		color: var(--ink-muted);

		span {
			display: flex;
			align-items: center;
			gap: var(--s-6);
		}
	}

	kbd {
		padding: 1px var(--s-6);
		border-radius: var(--r-check);
		background: var(--stone);
		font: inherit;
		font-weight: 600;
		color: var(--olive-800);
	}

	.search-enter-active,
	.search-leave-active {
		transition: opacity var(--t-ui) var(--ease-out);
	}

	.search-enter-from,
	.search-leave-to {
		opacity: 0;
	}

	@media (max-width: 767px) {
		.search-close {
			top: var(--s-10);
			right: var(--s-12);
		}

		.search-column {
			gap: var(--s-16);
			padding: var(--s-10) var(--gutter) var(--s-32);

			> .text-label {
				display: flex;
				align-items: center;
				min-height: var(--control-h);
				padding-right: 56px;
			}
		}

		.search-input,
		.search-input:focus {
			padding-bottom: var(--s-10);
			font-size: 26px;
		}

		.search-result-link {
			grid-template-columns: minmax(0, 1fr);
			gap: 3px;
		}

		.search-result-type {
			padding-top: 0;
		}

		.search-result-arrow,
		.search-keys {
			display: none;
		}
	}
</style>
