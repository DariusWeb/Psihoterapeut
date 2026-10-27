<script setup>
	import { computed, onMounted, ref } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import {
		ArrowRight, CalendarCheck, CalendarDays, CalendarX, ChevronLeft, ChevronRight, CircleAlert, Clock, CloudOff,
		Globe, Laptop, LoaderCircle, Lock, Sprout, Wallet
	} from '@lucide/vue'
	import SegmentedControl from '@/components/common/SegmentedControl.vue'
	import { useFormSubmit } from '@/composables/useFormSubmit'
	import { useFormErrorMessage } from '@/composables/useFormErrorMessage'
	import { SESSION_MINUTES, SESSION_PRICE_RON } from '@/session.config'

	const { t, locale } = useI18n()

	const slots = ref([])
	const slotMinutes = ref(SESSION_MINUTES)
	const loadState = ref('loading')
	const selectedDay = ref('')
	const selectedSlot = ref('')
	const monthIndex = ref(0)

	const form = ref({ name: '', email: '', phone: '', mode: 'online', message: '' })
	const consent = ref(false)
	const { status, errorCode, captcha, submit } = useFormSubmit('/booking')
	const errorMessage = useFormErrorMessage(errorCode, 'booking.form.error')

	const assurances = [Clock, Wallet, Laptop, Lock, Sprout]

	// Display only — sessions are paid outside the site.
	const sessionPriceRon = SESSION_PRICE_RON

	// The site renders Romanian copy in both locales, so the dates beside it are Romanian too.
	const dayFormat = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
	const timeFormat = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit' })
	const monthFormat = new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric' })
	const weekdayFormat = new Intl.DateTimeFormat('ro-RO', { weekday: 'narrow' })

	const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1)

	// 1 January 2024 was a Monday; the calendar starts its weeks on Monday.
	const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormat.format(new Date(2024, 0, 1 + index)))

	const modes = computed(() => [
		{ value: 'online', label: t('booking.form.modeOnline') },
		{ value: 'cabinet', label: t('booking.form.modeCabinet') }
	])

	// Slots show in the visitor's own zone, the one they'll read the reminder in.
	const days = computed(() => {
		const grouped = new Map()

		for (const iso of slots.value) {
			const at = new Date(iso)
			const key = at.toDateString()

			if (!grouped.has(key)) grouped.set(key, { key, date: at, times: [] })
			grouped.get(key).times.push({ iso, label: timeFormat.format(at) })
		}

		return [...grouped.values()]
	})

	const months = computed(() => {
		const unique = new Map()
		for (const { date } of days.value) {
			unique.set(`${date.getFullYear()}-${date.getMonth()}`, { year: date.getFullYear(), month: date.getMonth() })
		}
		return [...unique.values()]
	})

	const calendar = computed(() => {
		const shown = months.value[monthIndex.value]
		if (!shown) return { title: '', blanks: 0, cells: [] }

		const openDays = new Set(days.value.map((day) => day.key))
		const dayCount = new Date(shown.year, shown.month + 1, 0).getDate()

		return {
			title: capitalise(monthFormat.format(new Date(shown.year, shown.month, 1))),
			blanks: (new Date(shown.year, shown.month, 1).getDay() + 6) % 7,
			cells: Array.from({ length: dayCount }, (_, index) => {
				const date = new Date(shown.year, shown.month, index + 1)
				const key = date.toDateString()
				return { key, number: index + 1, label: dayFormat.format(date), open: openDays.has(key) }
			})
		}
	})

	const shownDay = computed(() => days.value.find((day) => day.key === selectedDay.value))
	const times = computed(() => shownDay.value?.times ?? [])
	const shownDayLabel = computed(() => (shownDay.value ? capitalise(dayFormat.format(shownDay.value.date)) : ''))

	const selectedLabel = computed(() => {
		if (!selectedSlot.value) return ''
		const at = new Date(selectedSlot.value)
		return `${dayFormat.format(at)}, ${timeFormat.format(at)}`
	})

	const bookedMeta = computed(() => t('booking.success.meta', {
		mode: modes.value.find((mode) => mode.value === form.value.mode)?.label,
		minutes: slotMinutes.value
	}))

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
	<main class="bands">
		<section class="band">
			<div class="split-5-7">
				<div class="sticky-side booking-intro">
					<div class="booking-head">
						<p class="booking-eyebrow">{{ t('booking.hero.eyebrow') }}</p>
						<h1 class="statement-title">{{ t('booking.hero.title') }}</h1>
					</div>
					<p class="text-lead text-pretty">{{ t('booking.hero.intro1') }}</p>
					<p class="booking-intro-text text-pretty">{{ t('booking.hero.intro2') }}</p>

					<ul class="icon-list booking-assurances">
						<li v-for="(icon, index) in assurances" :key="index" class="icon-list-item">
							<component :is="icon" :size="17" />
							{{ t(`booking.hero.a${index + 1}`, { minutes: slotMinutes, price: sessionPriceRon }) }}
						</li>
					</ul>

					<div class="booking-alternative">
						<p class="text-body-s">{{ t('booking.hero.alternative') }}</p>
						<RouterLink class="link-arrow" to="/contact#contact-form">
							{{ t('booking.hero.alternativeLink') }}<ArrowRight :size="17" />
						</RouterLink>
					</div>
				</div>

				<section class="booking-panel">
					<div v-if="status === 'success'" class="booking-state booking-state-done" role="status">
						<span class="booking-state-icon booking-state-icon-done"><Sprout :size="26" /></span>
						<h2>{{ t('booking.success.title') }}</h2>
						<div class="booking-when">
							<span class="booking-when-date">{{ selectedLabel }}</span>
							<span class="text-small">{{ bookedMeta }}</span>
						</div>
						<div class="booking-done-text">
							<p class="text-pretty">{{ t('booking.success.text') }}</p>
							<p class="booking-done-note text-pretty">{{ t('booking.success.note') }}</p>
						</div>
					</div>

					<div v-else-if="loadState === 'error' || (loadState === 'ready' && !days.length)" class="booking-state" role="status">
						<span class="booking-state-icon">
							<component :is="loadState === 'error' ? CloudOff : CalendarX" :size="24" />
						</span>
						<p class="booking-state-text text-pretty">
							{{ t(loadState === 'error' ? 'booking.widget.error' : 'booking.widget.empty') }}
						</p>
						<RouterLink class="button-primary" to="/contact#contact-form">{{ t('booking.widget.fallbackCta') }}</RouterLink>
					</div>

					<template v-else>
						<div class="booking-picker">
							<h2 class="booking-panel-title">
								<CalendarDays :size="20" />{{ t('booking.widget.pickTitle') }}
							</h2>

							<template v-if="loadState === 'loading'">
								<div class="booking-calendar skeleton" aria-hidden="true">
									<div class="booking-month">
										<div class="booking-month-head">
											<span class="booking-skeleton-bar booking-skeleton-title"></span>
											<div class="booking-month-nav">
												<span class="booking-skeleton-bar booking-skeleton-circle"></span>
												<span class="booking-skeleton-bar booking-skeleton-circle"></span>
											</div>
										</div>
										<div class="booking-days booking-skeleton-days">
											<span v-for="index in 35" :key="index" class="booking-skeleton-bar booking-day"></span>
										</div>
									</div>
									<div class="booking-times">
										<span class="booking-skeleton-bar booking-skeleton-label"></span>
										<div class="booking-time-grid">
											<span v-for="index in 8" :key="index" class="booking-skeleton-bar booking-skeleton-time"></span>
										</div>
									</div>
								</div>
								<p class="status-line" role="status">
									<LoaderCircle :size="14" class="button-spinner" aria-hidden="true" />
									{{ t('booking.widget.loading') }}
								</p>
							</template>

							<template v-else>
								<div class="booking-calendar">
									<div class="booking-month">
										<div class="booking-month-head">
											<span class="text-serif-s booking-month-title" aria-live="polite">{{ calendar.title }}</span>
											<div class="booking-month-nav">
												<button type="button" class="icon-button" :aria-label="t('booking.widget.prevMonth')"
													:disabled="monthIndex === 0" @click="monthIndex--">
													<ChevronLeft :size="18" />
												</button>
												<button type="button" class="icon-button" :aria-label="t('booking.widget.nextMonth')"
													:disabled="monthIndex >= months.length - 1" @click="monthIndex++">
													<ChevronRight :size="18" />
												</button>
											</div>
										</div>
										<div class="booking-weekdays" aria-hidden="true">
											<span v-for="(weekday, index) in weekdays" :key="index">{{ weekday }}</span>
										</div>
										<div class="booking-days" role="group" :aria-label="t('booking.widget.pickDay')">
											<span v-for="index in calendar.blanks" :key="`blank-${index}`"></span>
											<button v-for="cell in calendar.cells" :key="cell.key" type="button" class="booking-day"
												:class="{ 'booking-day-open': cell.open }" :aria-label="cell.label"
												:aria-pressed="cell.key === selectedDay" :disabled="!cell.open" @click="pickDay(cell.key)">
												{{ cell.number }}
											</button>
										</div>
									</div>

									<div class="booking-times">
										<span class="text-strip-title">{{ shownDayLabel }}</span>
										<div class="booking-time-grid" role="group" :aria-label="t('booking.widget.pickTime')">
											<button v-for="time in times" :key="time.iso" type="button" class="booking-time"
												:aria-pressed="time.iso === selectedSlot" @click="selectedSlot = time.iso">
												{{ time.label }}
											</button>
										</div>
									</div>
								</div>

								<p class="status-line">
									<Globe :size="14" aria-hidden="true" />
									{{ t('booking.widget.timezoneNote', { minutes: slotMinutes }) }}
								</p>
							</template>
						</div>

						<div class="booking-reveal" :class="{ 'booking-reveal-open': selectedSlot }" :inert="selectedSlot ? null : ''">
							<div class="booking-reveal-inner">
								<form class="form-panel booking-form" @submit.prevent="book">
									<h3 class="booking-panel-title">
										<CalendarCheck :size="20" /><span>{{ t('booking.form.title', { slot: selectedLabel }) }}</span>
									</h3>

									<div class="form-row">
										<div class="form-group">
											<input id="booking-name" v-model="form.name" type="text" placeholder=" " required autocomplete="given-name" />
											<label for="booking-name">{{ t('booking.form.name') }}</label>
										</div>
										<div class="form-group">
											<input id="booking-email" v-model="form.email" type="email" placeholder=" " required autocomplete="email" />
											<label for="booking-email">{{ t('booking.form.email') }}</label>
										</div>
									</div>

									<div class="form-group">
										<input id="booking-phone" v-model="form.phone" type="tel" placeholder=" " required autocomplete="tel" />
										<label for="booking-phone">{{ t('booking.form.phone') }}</label>
									</div>

									<SegmentedControl v-model="form.mode" class="booking-mode" :options="modes" :label="t('booking.form.modeLabel')" />

									<div class="form-group">
										<textarea id="booking-message" v-model="form.message" placeholder=" "></textarea>
										<label for="booking-message">{{ t('booking.form.message') }}</label>
									</div>

									<div class="checkbox-field">
										<input id="booking-consent" v-model="consent" type="checkbox" required />
										<label for="booking-consent">
											{{ t('booking.form.consent') }}
											<RouterLink class="text-link" to="/confidentialitate">{{ t('booking.form.consentLink') }}</RouterLink>.
										</label>
									</div>

									<div ref="captcha" class="booking-captcha"></div>

									<div class="booking-submit">
										<button type="submit" class="button-primary button-full"
											:aria-busy="status === 'submitting'" :disabled="status === 'submitting'">
											<LoaderCircle v-if="status === 'submitting'" :size="16" class="button-spinner" aria-hidden="true" />
											{{ t('booking.form.submit') }}
										</button>
										<p class="form-note">
											<Lock :size="14" aria-hidden="true" />
											{{ t('booking.form.privacy') }}
										</p>
									</div>

									<div v-if="status === 'error'" class="alert alert-error" role="alert">
										<span class="alert-icon"><CircleAlert :size="17" /></span>
										<p class="alert-text">{{ errorMessage }}</p>
									</div>
								</form>
							</div>
						</div>
					</template>
				</section>
			</div>
		</section>
	</main>
</template>

<style scoped lang="scss">
	.booking-intro {
		display: flex;
		flex-direction: column;
		gap: var(--s-20);
	}

	.booking-head {
		display: flex;
		flex-direction: column;
		gap: var(--s-10);
	}

	.booking-eyebrow {
		font-size: var(--fs-caption);
		font-weight: 700;
		line-height: 1.45;
		letter-spacing: 0.02em;
		color: var(--olive-700);
	}

	.booking-intro-text {
		max-width: 52ch;
	}

	.booking-assurances {
		margin-top: var(--s-4);
		padding-top: var(--s-20);
		border-top: 1px solid var(--hairline);
	}

	.booking-alternative {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-6);
		margin-top: var(--s-8);

		.text-body-s {
			line-height: 1.5;
			color: var(--ink-muted);
		}
	}

	.booking-panel {
		display: flex;
		flex-direction: column;
		padding: var(--panel-pad);
		border: 1px solid var(--line-card);
		border-radius: var(--r-card);
		background: var(--paper);
		box-shadow: var(--shadow-rest);
	}

	.booking-picker {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
	}

	.booking-panel-title {
		display: flex;
		align-items: flex-start;
		gap: var(--s-12);
		margin: 0;
		font-size: var(--fs-h3);
		line-height: var(--lh-h3);

		svg {
			flex: none;
			margin-top: calc((1lh - 20px) / 2);
			color: var(--olive-600);
		}
	}

	.booking-calendar {
		display: grid;
		grid-template-columns: var(--booking-calendar-cols, 262px minmax(0, 1fr));
		gap: var(--s-28);
		align-items: start;
	}

	.booking-month {
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	.booking-month-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-8);
	}

	.booking-month-title {
		line-height: 1.3;
		color: var(--olive-700);
	}

	.booking-month-nav {
		display: flex;
		gap: var(--s-8);

		.icon-button:disabled {
			opacity: 0.4;
			cursor: default;
		}
	}

	.booking-weekdays,
	.booking-days {
		display: grid;
		grid-template-columns: repeat(7, 34px);
		column-gap: var(--s-4);
	}

	.booking-weekdays {
		padding: var(--s-8) 0 var(--s-4);
		font-size: 12px;
		line-height: 1;
		text-align: center;
		color: var(--ink-muted);

		span {
			font-weight: 600;
		}
	}

	.booking-days {
		row-gap: var(--s-6);
	}

	.booking-day {
		width: 34px;
		height: 34px;
		padding: 0;
		border-radius: var(--r-pill);
		background: transparent;
		font-size: 13.5px;
		font-variant-numeric: tabular-nums;
		color: var(--disabled);
		transition: background-color var(--t-color), color var(--t-color), box-shadow var(--t-color);

		&:disabled,
		&:disabled:hover {
			background: transparent;
			color: var(--disabled);
			cursor: default;
		}
	}

	.booking-day-open {
		background: var(--sand);
		font-weight: 700;
		color: var(--ink);

		&:hover:not([aria-pressed='true']) {
			background: var(--sand);
			color: var(--ink);
			box-shadow: inset 0 0 0 1.5px var(--olive-600);
		}
	}

	.booking-day[aria-pressed='true'],
	.booking-time[aria-pressed='true'] {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--on-primary);
	}

	.booking-times {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding-top: var(--s-8);
	}

	.booking-time-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--s-8);
	}

	.booking-time {
		width: 100%;
		height: var(--control-h);
		padding: 0 var(--s-12);
		border: 1px solid var(--line-field);
		border-radius: var(--r-pill);
		background: var(--paper);
		font-size: var(--fs-body-s);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		transition: background-color var(--t-color), border-color var(--t-color), color var(--t-color);

		&:hover:not([aria-pressed='true']) {
			border-color: var(--olive-600);
			background: var(--paper);
			color: var(--ink);
		}
	}

	.booking-skeleton-bar {
		display: block;
		border-radius: var(--r-pill);
		background: var(--sand);
	}

	.booking-skeleton-days {
		padding-top: 26px;
	}

	.booking-skeleton-title {
		width: 150px;
		height: 18px;
	}

	.booking-skeleton-circle {
		width: var(--control-h);
		height: var(--control-h);
	}

	.booking-skeleton-label {
		width: 180px;
		height: 18px;
	}

	.booking-skeleton-time {
		height: var(--control-h);
	}

	// Rows animate from 0fr to 1fr, so the form slides open at its own height.
	.booking-reveal {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		visibility: hidden;
		transition: grid-template-rows var(--t-ui) var(--ease-out), opacity var(--t-ui) var(--ease-out), visibility var(--t-ui);
	}

	.booking-reveal-open {
		grid-template-rows: 1fr;
		opacity: 1;
		visibility: visible;
	}

	// The 4px gutter keeps the 3px field focus ring inside the clipped area.
	.booking-reveal-inner {
		min-height: 0;
		margin-inline: -4px;
		padding-inline: 4px;
		overflow: hidden;
	}

	.booking-form {
		margin-top: var(--s-32);
		padding: var(--s-32) 0 0;
		border: 0;
		border-top: 1px solid var(--line-card);
		border-radius: 0;
		background: none;
		box-shadow: none;

		.booking-panel-title {
			margin-bottom: var(--s-8);
		}
	}

	.booking-mode {
		padding: var(--s-4) 0;
	}

	.booking-captcha:empty {
		display: none;
	}

	.booking-submit {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding-top: var(--s-4);
	}

	.booking-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-20);
		padding: 40px var(--s-16);
		text-align: center;

		h2 {
			margin: 0;
		}
	}

	.booking-state-done {
		padding-block: var(--s-24);
	}

	.booking-state-icon {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--sand);
		color: var(--label);
	}

	.booking-state-icon-done {
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.booking-state-text {
		max-width: 42ch;
	}

	.booking-when {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-16) var(--s-28);
		border-radius: var(--r-row);
		background: var(--sand);
	}

	.booking-when-date {
		font-family: var(--font-serif);
		font-size: 20px;
		line-height: 1.4;
		color: var(--olive-700);
	}

	.booking-done-text {
		display: flex;
		flex-direction: column;
		gap: var(--s-8);
		max-width: 44ch;

		.booking-done-note {
			font-size: var(--fs-small);
			line-height: 1.55;
			color: var(--ink-muted);
		}
	}

	// Under 375, 7 × 38 + 24 no longer fits, so the days shrink.
	@media (max-width: 767px) {
		.booking-panel {
			padding: var(--s-20);
		}

		.booking-calendar {
			gap: var(--s-14);
		}

		.booking-weekdays,
		.booking-days {
			grid-template-columns: repeat(7, minmax(0, 38px));
		}

		.booking-day {
			width: 100%;
			height: auto;
			aspect-ratio: 1;
			font-size: var(--fs-small);
		}

		.booking-times {
			gap: var(--s-14);
			padding-top: 0;

			> .text-strip-title {
				padding-top: var(--s-6);
				border-top: 1px solid var(--line-card);
			}
		}

		.booking-time-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
