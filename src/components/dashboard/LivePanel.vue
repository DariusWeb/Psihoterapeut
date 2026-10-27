<script setup>
	import { computed, nextTick, onMounted, reactive, ref } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { Check, CircleAlert, CircleDashed, CloudOff, Hourglass, LoaderCircle, Radio, X } from '@lucide/vue'
	import SegmentedControl from '@/components/common/SegmentedControl.vue'
	import { clearLive, fetchLiveState, publishLive } from '@/services/dashboardApi'

	const { t } = useI18n()

	const PLATFORMS = ['youtube', 'linkedin', 'instagram', 'facebook', 'other']
	const DELAYS = [0, 10, 20, 30]
	const DURATIONS = [30, 60, 120, 240, 0]
	const DRAFT_KEY = 'dashboard-live-draft'
	const STATE_ICONS = { scheduled: Hourglass, none: CircleDashed }

	const form = reactive({
		title: '',
		text: '',
		ctaLabel: '',
		url: '',
		platform: 'youtube',
		delayMinutes: 0,
		durationMinutes: 120
	})

	const current = ref({ state: 'loading' })
	const busy = ref('') // 'publish' | 'stop' | 'retry' while that request runs
	const notice = ref({ text: '', kind: 'success', open: false })
	const pendingConfirm = ref('') // 'replace' | 'stop'
	const cancelConfirmButton = ref(null)
	const publishButton = ref(null)
	const urlFocused = ref(false)
	let focusReturn = null

	const isOn = computed(() => current.value.state === 'live' || current.value.state === 'scheduled')

	const stateLabel = computed(() => {
		const { state, minutesUntilVisible } = current.value
		if (state === 'live') return t('dashboard.live.stateLive')
		if (state === 'scheduled') return t('dashboard.live.stateScheduled', { minutes: minutesUntilVisible })
		if (state === 'none') return t('dashboard.live.stateNone')
		if (state === 'loading') return t('dashboard.loading')
		return t('dashboard.live.stateUnknown')
	})

	const delayOptions = computed(() => DELAYS.map((value) => ({ value, label: t(`dashboard.live.delays.${value}`) })))
	const durationOptions = computed(() => DURATIONS.map((value) => ({ value, label: t(`dashboard.live.durations.${value}`) })))

	const summary = computed(() =>
		t('dashboard.live.summary', {
			start: form.delayMinutes
				? t('dashboard.live.summaryLater', { minutes: form.delayMinutes })
				: t('dashboard.live.summaryNow'),
			end: form.durationMinutes
				? t('dashboard.live.summaryFor', { duration: t(`dashboard.live.durations.${form.durationMinutes}`) })
				: t('dashboard.live.summaryUntilStopped')
		})
	)

	const confirmText = computed(() => {
		if (pendingConfirm.value === 'stop') return t('dashboard.live.confirmStop')
		return current.value.state === 'scheduled'
			? t('dashboard.live.confirmScheduled', { minutes: current.value.minutesUntilVisible })
			: t('dashboard.live.confirmLive')
	})

	// Everything but the link persists, so going live is "paste the link and press".
	onMounted(() => {
		Object.assign(form, readDraft(), { url: '' })
		refresh()
	})

	function readDraft() {
		try {
			return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}')
		} catch {
			return {}
		}
	}

	function say(text, kind = 'success') {
		notice.value = { text, kind, open: true }
	}

	async function refresh() {
		try {
			current.value = await fetchLiveState()
		} catch {
			current.value = { state: 'unknown' }
		}
	}

	// A disabled busy button or an unmounted confirm box drops focus to the page top; put it back.
	async function restoreFocus() {
		await nextTick()
		const target = focusReturn?.isConnected && !focusReturn.disabled ? focusReturn : publishButton.value
		target?.focus()
	}

	async function retry() {
		focusReturn = document.activeElement
		busy.value = 'retry'
		await refresh()
		busy.value = ''
		restoreFocus()
	}

	// Replacing destroys an announcement nobody may have seen yet, and stopping drops the link, so neither is silent.
	async function askToConfirm(kind) {
		focusReturn = document.activeElement
		pendingConfirm.value = kind
		notice.value.open = false
		await nextTick()
		cancelConfirmButton.value?.focus()
	}

	function closeConfirm() {
		pendingConfirm.value = ''
		restoreFocus()
	}

	async function requestPublish() {
		if (busy.value) return
		if (isOn.value) return askToConfirm('replace')
		focusReturn = document.activeElement
		await publish()
		restoreFocus()
	}

	async function confirmPending() {
		const kind = pendingConfirm.value
		pendingConfirm.value = ''
		await (kind === 'stop' ? stop() : publish())
		restoreFocus()
	}

	async function publish() {
		busy.value = 'publish'
		notice.value.open = false

		// the link is the one field that changes every time, so it is never remembered
		const draft = { ...form }
		delete draft.url
		localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))

		try {
			const result = await publishLive({ ...form })
			say(
				result.startsAt > Date.now()
					? t('dashboard.live.scheduled', { minutes: Math.ceil((result.startsAt - Date.now()) / 60000) })
					: t('dashboard.live.published')
			)
			await refresh()
		} catch (error) {
			say(t(`dashboard.live.errors.${error.message}`, t('dashboard.live.errors.generic')), 'error')
		} finally {
			busy.value = ''
		}
	}

	async function stop() {
		busy.value = 'stop'
		notice.value.open = false
		try {
			await clearLive()
			say(t('dashboard.live.stopped'))
			await refresh()
		} catch {
			say(t('dashboard.live.errors.generic'), 'error')
		} finally {
			busy.value = ''
		}
	}
</script>

<template>
	<section class="live-panel" aria-labelledby="live-panel-title">
		<h2 id="live-panel-title" class="section-title">{{ t('dashboard.panels.live') }}</h2>

		<div class="live-state" :class="{ 'live-state-on': current.state === 'live', 'live-state-strong': isOn }">
			<span v-if="current.state === 'live'" class="live-dot" aria-hidden="true"></span>
			<LoaderCircle v-else-if="current.state === 'loading'" class="button-spinner live-state-icon" :size="18"
				aria-hidden="true" />
			<component :is="STATE_ICONS[current.state] ?? CloudOff" v-else class="live-state-icon"
				:class="{ 'live-state-icon-on': isOn }" :size="18" aria-hidden="true" />

			<div class="live-state-copy" role="status">
				<span class="live-state-label">{{ stateLabel }}</span>
				<span v-if="isOn" class="live-state-title">{{ current.announcement.title }}</span>
			</div>

			<button v-if="isOn" type="button" class="button-outline" :aria-busy="busy === 'stop'" :disabled="!!busy"
				@click="askToConfirm('stop')">
				<LoaderCircle v-if="busy === 'stop'" class="button-spinner" :size="16" aria-hidden="true" />
				{{ t('dashboard.live.stop') }}
			</button>
			<button v-else-if="current.state === 'unknown'" type="button" class="button-outline"
				:aria-busy="busy === 'retry'" :disabled="!!busy" @click="retry">
				<LoaderCircle v-if="busy === 'retry'" class="button-spinner" :size="16" aria-hidden="true" />
				{{ t('dashboard.live.retry') }}
			</button>
		</div>

		<form class="live-form form-panel" @submit.prevent="requestPublish">
			<div class="live-fields">
				<div class="form-group">
					<input id="live-title" v-model="form.title" maxlength="80" required placeholder=" " />
					<label for="live-title">{{ t('dashboard.live.fields.title') }}</label>
				</div>

				<div class="form-group">
					<input id="live-text" v-model="form.text" maxlength="200" placeholder=" " />
					<label for="live-text">{{ t('dashboard.live.fields.text') }}</label>
				</div>

				<div class="form-row">
					<div class="form-group">
						<input id="live-cta" v-model="form.ctaLabel" maxlength="40" placeholder=" " />
						<label for="live-cta">{{ t('dashboard.live.fields.ctaLabel') }}</label>
					</div>

					<div class="form-group">
						<select id="live-platform" v-model="form.platform">
							<option v-for="value in PLATFORMS" :key="value" :value="value">
								{{ t(`dashboard.live.platforms.${value}`) }}
							</option>
						</select>
						<label for="live-platform">{{ t('dashboard.live.fields.platform') }}</label>
					</div>
				</div>

				<div class="form-group">
					<input id="live-url" v-model="form.url" type="url" maxlength="500" :placeholder="urlFocused ? 'https://' : ' '"
						@focus="urlFocused = true" @blur="urlFocused = false" />
					<label for="live-url">{{ t('dashboard.live.fields.url') }}</label>
				</div>
			</div>

			<div class="live-timing">
				<SegmentedControl v-model="form.delayMinutes" :options="delayOptions" :label="t('dashboard.live.fields.delay')" />
				<SegmentedControl v-model="form.durationMinutes" :options="durationOptions"
					:label="t('dashboard.live.fields.duration')" />
			</div>

			<div class="live-preview">
				<p class="live-preview-head"><b>{{ t('dashboard.live.preview.label') }}</b>{{ t('dashboard.live.preview.hint') }}</p>
				<div class="float-banner live-preview-banner" aria-hidden="true">
					<Radio :size="20" />
					<div class="float-banner-copy">
						<p class="float-banner-title" :class="{ 'live-preview-empty': !form.title.trim() }">
							{{ form.title.trim() || t('dashboard.live.preview.placeholderTitle') }}
						</p>
						<p v-if="form.text.trim()" class="float-banner-text">{{ form.text.trim() }}</p>
					</div>
					<span v-if="form.url.trim()" class="button-primary">{{ form.ctaLabel.trim() || t('live.watch') }}</span>
					<span class="icon-button icon-button-bare"><X :size="18" /></span>
				</div>
				<p v-if="!form.url.trim()" class="live-preview-note">{{ t('dashboard.live.preview.noLink') }}</p>
			</div>

			<div class="live-submit">
				<div v-if="!pendingConfirm" class="live-actions">
					<button ref="publishButton" type="submit" class="button-primary" :aria-busy="busy === 'publish'"
						:disabled="!!busy">
						<LoaderCircle v-if="busy === 'publish'" class="button-spinner" :size="16" aria-hidden="true" />
						{{ t('dashboard.live.publish') }}
					</button>
					<p class="text-small">{{ summary }}</p>
				</div>

				<div v-else class="live-confirm" role="alertdialog" aria-labelledby="live-confirm-text">
					<p id="live-confirm-text" class="live-confirm-text">
						<CircleAlert :size="18" aria-hidden="true" />{{ confirmText }}
					</p>
					<div class="actions live-confirm-actions">
						<button type="button" class="button-primary" @click="confirmPending">
							{{ pendingConfirm === 'stop' ? t('dashboard.live.confirmStopYes') : t('dashboard.live.confirmYes') }}
						</button>
						<button ref="cancelConfirmButton" type="button" class="button-outline" @click="closeConfirm">
							{{ t('dashboard.live.confirmNo') }}
						</button>
					</div>
				</div>

				<div class="live-notice" :class="{ 'live-notice-open': notice.open }">
					<div class="live-notice-clip">
						<div class="alert" :class="{ 'alert-error': notice.kind === 'error' }" role="status">
							<span class="alert-icon">
								<component :is="notice.kind === 'error' ? CircleAlert : Check" :size="17" aria-hidden="true" />
							</span>
							<p class="alert-text">{{ notice.text }}</p>
						</div>
					</div>
				</div>
			</div>
		</form>
	</section>
</template>

<style lang="scss" scoped>
	.live-panel {
		display: flex;
		flex-direction: column;
		gap: var(--s-28);
		padding: var(--panel-pad);
		border: 1px solid var(--line-card);
		border-radius: var(--r-card);
		background: var(--paper);
		box-shadow: var(--shadow-rest);
	}

	.live-state {
		display: flex;
		align-items: center;
		gap: var(--s-14);
		min-height: 68px;
		padding: var(--s-12) var(--s-12) var(--s-12) var(--s-20);
		border-radius: var(--r-row);
		background: var(--sand);
		transition: background-color var(--t-ui) var(--ease-out);
	}

	.live-state-on {
		background: var(--olive-tint);
	}

	.live-state-icon {
		flex: none;
		color: var(--label);
	}

	.live-state-icon-on {
		color: var(--olive-600);
	}

	.live-dot {
		position: relative;
		flex: none;
		width: 18px;
		height: 18px;

		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: 4px;
			border-radius: 50%;
			background: var(--rose);
		}

		&::before {
			animation: live-dot-pulse 1.8s var(--ease-out) infinite;
		}
	}

	@keyframes live-dot-pulse {
		0% {
			transform: scale(1);
			opacity: 0.6;
		}

		80%,
		100% {
			transform: scale(2.8);
			opacity: 0;
		}
	}

	.live-state-copy {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.live-state-label {
		font-size: var(--fs-body-s);
		font-weight: 600;
		line-height: 1.45;
		color: var(--olive-800);

		.live-state-strong & {
			font-size: var(--fs-caption);
			font-weight: 700;
		}
	}

	.live-state-title {
		font-family: var(--font-serif);
		font-size: var(--fs-serif-s);
		line-height: 1.4;
		color: var(--olive-700);
		overflow-wrap: anywhere;
	}

	// The panel is the card; the form inside keeps .form-panel's spacing without its card look.
	.live-form {
		gap: var(--s-28);
		padding: 0;
		border: 0;
		border-radius: 0;
		background: none;
		box-shadow: none;
	}

	.live-fields {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
	}

	// Four- and five-option toggles: tighter options so they fit on one row.
	.live-timing {
		--segmented-pad: var(--s-14);

		display: flex;
		flex-wrap: wrap;
		gap: var(--s-16) var(--s-32);
	}

	.live-preview {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding-top: var(--s-28);
		border-top: 1px solid var(--line-card);
	}

	.live-preview-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--s-8);
		font-size: var(--fs-caption);
		line-height: 1.5;
		color: var(--ink-muted);

		b {
			color: var(--olive-800);
		}
	}

	.live-preview-banner {
		pointer-events: none;
	}

	.live-preview-empty {
		color: var(--label);
	}

	.live-preview-note {
		padding-left: 22px;
		font-size: var(--fs-caption);
		line-height: 1.5;
		color: var(--ink-muted);
	}

	.live-submit {
		display: flex;
		flex-direction: column;
	}

	.live-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-16);
	}

	.live-confirm {
		display: flex;
		flex-direction: column;
		gap: var(--s-14);
		padding: 18px var(--s-20);
		border: 1px solid var(--line-field);
		border-radius: var(--r-row);
		background: var(--sand);
	}

	.live-confirm-text {
		display: flex;
		align-items: flex-start;
		gap: var(--s-12);
		font-size: var(--fs-body-s);
		line-height: 1.55;

		svg {
			flex: none;
			margin-top: 3px;
			color: var(--rose);
		}
	}

	.live-confirm-actions {
		padding-left: 30px;
	}

	// Rows animate from 0fr to 1fr, so the notice slides open at its own height.
	.live-notice {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition: grid-template-rows var(--t-ui) var(--ease-out), opacity var(--t-ui) var(--ease-out);
	}

	.live-notice-open {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.live-notice-clip {
		min-height: 0;
		overflow: hidden;

		.alert {
			margin-top: var(--s-16);
		}
	}

	@media (max-width: 767px) {
		.live-form .form-row {
			flex-direction: column;
		}

		.live-timing > * {
			flex-basis: 100%;
		}
	}
</style>
