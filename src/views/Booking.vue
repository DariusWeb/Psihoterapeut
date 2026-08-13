<script setup>
	import { computed, onMounted, ref } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { CalendarDays, Clock, Laptop, Lock, Sprout } from '@lucide/vue'
	import { useFormSubmit } from '@/composables/useFormSubmit'

	const { t, locale } = useI18n()

	const slots = ref([])
	const slotMinutes = ref(50)
	const loadState = ref('loading')
	const selectedDay = ref('')
	const selectedSlot = ref('')

	const form = ref({ name: '', email: '', phone: '', mode: 'online', message: '' })
	const consent = ref(false)
	const { status, captcha, submit } = useFormSubmit('/booking')

	const assurances = [Clock, Laptop, Lock, Sprout]

	// The site renders Romanian copy in both locales, so the dates beside it are Romanian too.
	const dayFormat = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
	const timeFormat = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit' })

	// Slots arrive as instants and are shown in the visitor's own zone, which is the one they
	// will read the reminder in — the Worker holds the therapist's zone.
	const days = computed(() => {
		const grouped = new Map()

		for (const iso of slots.value) {
			const at = new Date(iso)
			const key = at.toDateString()

			if (!grouped.has(key)) grouped.set(key, { key, label: dayFormat.format(at), times: [] })
			grouped.get(key).times.push({ iso, label: timeFormat.format(at) })
		}

		return [...grouped.values()]
	})

	const times = computed(() => days.value.find((day) => day.key === selectedDay.value)?.times ?? [])

	const selectedLabel = computed(() => {
		if (!selectedSlot.value) return ''
		const at = new Date(selectedSlot.value)
		return `${dayFormat.format(at)}, ${timeFormat.format(at)}`
	})

	const pickDay = (key) => {
		selectedDay.value = key
		selectedSlot.value = ''
	}

	onMounted(async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_FORM_ENDPOINT}/booking/slots`)
			const body = await response.json()
			if (!body.ok) throw new Error(body.error)

			slots.value = body.slots
			slotMinutes.value = body.slotMinutes
			selectedDay.value = days.value[0]?.key ?? ''
			loadState.value = 'ready'
		} catch {
			loadState.value = 'error'
		}
	})

	const book = async () => {
		const booked = await submit({
			...form.value,
			start: selectedSlot.value,
			locale: locale.value,
			// the exact wording the visitor agreed to, stored as the consent proof
			consentText: `${t('booking.form.consent')} ${t('booking.form.consentLink')}.`
		})

		if (!booked) return

		slots.value = slots.value.filter((iso) => iso !== selectedSlot.value)
	}
</script>

<template>
	<main class="booking-page layout-stack">
		<section class="page-hero">
			<div class="page-hero-content">
				<p class="booking-eyebrow">{{ t('booking.hero.eyebrow') }}</p>
				<h1 class="page-hero-title">{{ t('booking.hero.title') }}</h1>
				<p class="page-hero-intro">{{ t('booking.hero.intro1') }}</p>
				<p class="page-hero-intro">{{ t('booking.hero.intro2') }}</p>

				<div class="booking-assurances">
					<p v-for="(icon, index) in assurances" :key="index" class="booking-assurance">
						<component :is="icon" :size="18" />
						{{ t(`booking.hero.a${index + 1}`) }}
					</p>
				</div>

				<p class="booking-alternative">
					{{ t('booking.hero.alternative') }}
					<RouterLink to="/contact#contact-form">{{ t('booking.hero.alternativeLink') }}</RouterLink>.
				</p>
			</div>

			<section class="booking-panel card">
				<div v-if="status === 'success'" class="booking-done" role="status">
					<Sprout :size="32" />
					<h2 class="booking-done-title">{{ t('booking.success.title') }}</h2>
					<p class="booking-done-when">{{ selectedLabel }}</p>
					<p>{{ t('booking.success.text') }}</p>
					<p class="booking-done-note">{{ t('booking.success.note') }}</p>
				</div>

				<p v-else-if="loadState === 'loading'" class="booking-state">{{ t('booking.widget.loading') }}</p>

				<div v-else-if="loadState === 'error' || !days.length" class="booking-state">
					<p>{{ t(loadState === 'error' ? 'booking.widget.error' : 'booking.widget.empty') }}</p>
					<RouterLink class="button button-primary" to="/contact#contact-form">
						{{ t('booking.widget.fallbackCta') }}
					</RouterLink>
				</div>

				<template v-else>
					<h2 class="booking-title">
						<CalendarDays :size="22" />
						{{ t('booking.widget.pickDay') }}
					</h2>

					<div class="booking-chips" role="group" :aria-label="t('booking.widget.pickDay')">
						<button v-for="day in days" :key="day.key" type="button" class="booking-chip"
							:class="{ 'booking-chip-active': day.key === selectedDay }"
							:aria-pressed="day.key === selectedDay" @click="pickDay(day.key)">
							{{ day.label }}
						</button>
					</div>

					<h3 class="booking-subtitle">
						<Clock :size="18" />
						{{ t('booking.widget.pickTime') }}
					</h3>

					<div class="booking-chips" role="group" :aria-label="t('booking.widget.pickTime')">
						<button v-for="time in times" :key="time.iso" type="button" class="booking-chip"
							:class="{ 'booking-chip-active': time.iso === selectedSlot }"
							:aria-pressed="time.iso === selectedSlot" @click="selectedSlot = time.iso">
							{{ time.label }}
						</button>
					</div>

					<p class="booking-note">{{ t('booking.widget.timezoneNote', { minutes: slotMinutes }) }}</p>

					<form v-if="selectedSlot" class="booking-form" @submit.prevent="book">
						<h3 class="booking-form-title">{{ t('booking.form.title', { slot: selectedLabel }) }}</h3>

						<div class="form-row">
							<div class="form-group">
								<input id="booking-name" type="text" v-model="form.name" placeholder=" " required />
								<label for="booking-name">{{ t('booking.form.name') }}</label>
							</div>

							<div class="form-group">
								<input id="booking-email" type="email" v-model="form.email" placeholder=" " required />
								<label for="booking-email">{{ t('booking.form.email') }}</label>
							</div>
						</div>

						<div class="form-group">
							<input id="booking-phone" type="tel" v-model="form.phone" placeholder=" " required />
							<label for="booking-phone">{{ t('booking.form.phone') }}</label>
						</div>

						<label class="booking-mode-label" for="booking-mode">{{ t('booking.form.modeLabel') }}</label>
						<select id="booking-mode" v-model="form.mode" class="booking-mode">
							<option value="online">{{ t('booking.form.modeOnline') }}</option>
							<option value="cabinet">{{ t('booking.form.modeCabinet') }}</option>
						</select>

						<div class="form-group">
							<textarea id="booking-message" v-model="form.message" rows="3" placeholder=" "></textarea>
							<label for="booking-message">{{ t('booking.form.message') }}</label>
						</div>

						<div class="booking-consent">
							<input id="booking-consent" v-model="consent" type="checkbox" required />
							<label for="booking-consent">
								{{ t('booking.form.consent') }}
								<RouterLink to="/confidentialitate">{{ t('booking.form.consentLink') }}</RouterLink>.
							</label>
						</div>

						<div ref="captcha" class="booking-captcha"></div>

						<button type="submit" class="button-primary booking-submit" :disabled="status === 'submitting'">
							{{ t('booking.form.submit') }}
						</button>

						<p class="booking-privacy">
							<Lock :size="16" />
							{{ t('booking.form.privacy') }}
						</p>

						<div v-if="status === 'error'" class="error" role="alert">{{ t('booking.form.error') }}</div>
					</form>
				</template>
			</section>
		</section>
	</main>
</template>

<style scoped lang="scss">
	.booking-eyebrow {
		margin: 0;
		color: var(--vt-c-jannafer-green);
	}

	.booking-assurances {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.booking-assurance {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0;

		svg {
			flex-shrink: 0;
			color: var(--vt-c-jannafer-green);
		}
	}

	.booking-alternative {
		margin: 0;
		font-size: 0.9rem;
	}

	.booking-panel {
		flex: 0 0 52%;
		align-self: flex-start;
		// clears the fixed nav, like the hero copy beside it
		margin-top: clamp(5rem, 3.4rem + 3.2vw, 7rem);
	}

	.booking-title,
	.booking-subtitle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 1rem;

		svg {
			color: var(--vt-c-jannafer-green);
		}
	}

	.booking-subtitle {
		margin-top: 2rem;
		font-family: "Mulish Variable", sans-serif;
		font-size: 1rem;
	}

	.booking-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.booking-chip {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		background: var(--vt-c-background);
		box-shadow: inset 0 0 0 1px var(--vt-c-jannafer-gray2);
	}

	.booking-chip-active {
		background: var(--vt-c-jannafer-green);
		color: var(--vt-c-on-accent);
		box-shadow: none;
	}

	.booking-note {
		margin: 1rem 0 0;
		font-size: 0.9rem;
	}

	.booking-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;

		p {
			margin: 0;
		}
	}

	.booking-form {
		margin-top: 2rem;
	}

	.booking-form-title {
		margin: 0 0 1rem;
		font-family: "Mulish Variable", sans-serif;
		font-size: 1rem;
	}

	.booking-form input:not([type="checkbox"]),
	.booking-form textarea,
	.booking-mode {
		width: 100%;
	}

	.booking-mode-label {
		display: block;
		margin: 0.5rem 0 0.25rem;
		font-size: 0.7rem;
	}

	.booking-consent {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin: 1rem 0;
		font-size: 0.9rem;

		label {
			cursor: pointer;
		}
	}

	// empty until a challenge actually renders, so it must not reserve space
	.booking-captcha:not(:empty) {
		margin-bottom: 1rem;
	}

	.booking-submit {
		width: 100%;
	}

	.booking-privacy {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 1rem 0 0;
		font-size: 0.9rem;
	}

	.booking-done {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
		color: var(--vt-c-jannafer-green);

		p {
			margin: 0;
			color: var(--vt-c-black);
		}
	}

	.booking-done-title {
		margin: 0;
	}

	.booking-done-when {
		font-family: "Libre Baskerville", serif;
	}

	.booking-done-note {
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.booking-panel {
			flex: auto;
			margin-top: 0;
		}
	}
</style>
