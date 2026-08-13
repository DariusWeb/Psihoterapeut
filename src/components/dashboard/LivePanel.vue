<script setup>
	import { onMounted, reactive, ref } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { clearLive, fetchLiveState, publishLive } from '@/services/dashboardApi'

	const { t } = useI18n()

	const PLATFORMS = ['youtube', 'linkedin', 'instagram', 'facebook', 'other']
	const DELAYS = [0, 10, 20, 30]
	const DURATIONS = [30, 60, 120, 240, 0]
	const DRAFT_KEY = 'dashboard-live-draft'

	const form = reactive({
		title: '',
		text: '',
		ctaLabel: '',
		url: '',
		platform: 'youtube',
		delayMinutes: 0,
		durationMinutes: 120
	})

	const current = ref({ state: 'unknown' })
	const status = ref('idle')
	const message = ref('')
	const pendingConfirm = ref(false)

	// Everything but the link persists, so going live is "paste the link and press".
	onMounted(() => {
		Object.assign(form, JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'), { url: '' })
		refresh()
	})

	async function refresh() {
		try {
			current.value = await fetchLiveState()
		} catch {
			current.value = { state: 'unknown' }
		}
	}

	function requestPublish() {
		// Replacing a scheduled announcement destroys one nobody has seen yet and pushes
		// the message later than intended, so it is never silent.
		if (current.value.state === 'scheduled' || current.value.state === 'live') {
			pendingConfirm.value = true
			return
		}
		publish()
	}

	async function publish() {
		pendingConfirm.value = false
		status.value = 'working'
		message.value = ''

		// the link is the one field that changes every time, so it is never remembered
		const draft = { ...form }
		delete draft.url
		localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))

		try {
			const result = await publishLive({ ...form })
			status.value = 'success'
			message.value =
				result.startsAt > Date.now()
					? t('dashboard.live.scheduled', { minutes: Math.ceil((result.startsAt - Date.now()) / 60000) })
					: t('dashboard.live.published')
			refresh()
		} catch (error) {
			status.value = 'error'
			message.value = t(`dashboard.live.errors.${error.message}`, t('dashboard.live.errors.generic'))
		}
	}

	async function stop() {
		status.value = 'working'
		try {
			await clearLive()
			status.value = 'success'
			message.value = t('dashboard.live.stopped')
			refresh()
		} catch {
			status.value = 'error'
			message.value = t('dashboard.live.errors.generic')
		}
	}
</script>

<template>
	<section class="live-panel card">
		<h2>{{ t('dashboard.panels.live') }}</h2>

		<p class="live-state" :class="current.state">
			<template v-if="current.state === 'live'">
				{{ t('dashboard.live.stateLive', { title: current.announcement.title }) }}
			</template>
			<template v-else-if="current.state === 'scheduled'">
				{{
					t('dashboard.live.stateScheduled', {
						title: current.announcement.title,
						minutes: current.minutesUntilVisible
					})
				}}
			</template>
			<template v-else-if="current.state === 'none'">{{ t('dashboard.live.stateNone') }}</template>
			<template v-else>{{ t('dashboard.live.stateUnknown') }}</template>
		</p>

		<form class="live-form" @submit.prevent="requestPublish">
			<label>
				{{ t('dashboard.live.fields.title') }}
				<input v-model="form.title" maxlength="80" required />
			</label>

			<label>
				{{ t('dashboard.live.fields.text') }}
				<input v-model="form.text" maxlength="200" />
			</label>

			<div class="live-row">
				<label>
					{{ t('dashboard.live.fields.ctaLabel') }}
					<input v-model="form.ctaLabel" maxlength="40" />
				</label>

				<label>
					{{ t('dashboard.live.fields.platform') }}
					<select v-model="form.platform">
						<option v-for="value in PLATFORMS" :key="value" :value="value">
							{{ t(`dashboard.live.platforms.${value}`) }}
						</option>
					</select>
				</label>
			</div>

			<label>
				{{ t('dashboard.live.fields.url') }}
				<input v-model="form.url" type="url" maxlength="500" placeholder="https://" />
			</label>

			<div class="live-row">
				<label>
					{{ t('dashboard.live.fields.delay') }}
					<select v-model.number="form.delayMinutes">
						<option v-for="value in DELAYS" :key="value" :value="value">
							{{ t(`dashboard.live.delays.${value}`) }}
						</option>
					</select>
				</label>

				<label>
					{{ t('dashboard.live.fields.duration') }}
					<select v-model.number="form.durationMinutes">
						<option v-for="value in DURATIONS" :key="value" :value="value">
							{{ t(`dashboard.live.durations.${value}`) }}
						</option>
					</select>
				</label>
			</div>

			<div class="live-actions">
				<button class="button button-primary" type="submit" :disabled="status === 'working'">
					{{ t('dashboard.live.publish') }}
				</button>
				<button
					class="button button-outline"
					type="button"
					:disabled="status === 'working'"
					@click="stop"
				>
					{{ t('dashboard.live.stop') }}
				</button>
			</div>
		</form>

		<p v-if="message" :class="status === 'error' ? 'error' : 'success'" role="status">
			{{ message }}
		</p>

		<div v-if="pendingConfirm" class="live-confirm" role="alertdialog" aria-labelledby="live-confirm-text">
			<p id="live-confirm-text">
				{{
					current.state === 'scheduled'
						? t('dashboard.live.confirmScheduled', { minutes: current.minutesUntilVisible })
						: t('dashboard.live.confirmLive')
				}}
			</p>
			<div class="live-actions">
				<button class="button button-primary" @click="publish">
					{{ t('dashboard.live.confirmYes') }}
				</button>
				<button class="button button-outline" @click="pendingConfirm = false">
					{{ t('dashboard.live.confirmNo') }}
				</button>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
	.live-panel {
		padding: var(--card-padding);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.live-panel h2 {
		margin: 0;
	}

	.live-state {
		margin: 0;
		padding: 0.75rem 1rem;
		border-radius: var(--vt-c-border-radius);
		background: var(--vt-c-jannafer-gray);
		font-size: 0.9rem;
	}

	.live-state.live {
		background: var(--vt-c-jannafer-gray2);
		font-weight: 700;
	}

	.live-form {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.live-form label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.live-form input,
	.live-form select {
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--vt-c-jannafer-gray2);
		border-radius: var(--vt-c-border-radius);
		background: var(--vt-c-background);
		color: var(--vt-c-black);
		font: inherit;
		font-weight: 400;
	}

	.live-row {
		display: flex;
		gap: 0.85rem;
	}

	.live-row > label {
		flex: 1;
	}

	.live-actions {
		display: flex;
		gap: 0.75rem;
	}

	.live-confirm {
		padding: var(--card-padding-compact);
		border: 1px solid var(--vt-c-jannafer-gray2);
		border-radius: var(--vt-c-border-radius);
		background: var(--vt-c-surface);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.live-confirm p {
		margin: 0;
	}

	@media (max-width: 600px) {
		.live-row {
			flex-direction: column;
		}
	}
</style>
