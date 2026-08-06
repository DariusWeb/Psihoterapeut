<script setup>
	import { ref } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Sprout, Laptop, Mail, Phone, MessageCircle, CalendarDays, UserRound, Heart, Lock, Clock } from '@lucide/vue'
	import contactDesk from '@/assets/images/contact/contact-desk.webp'
	import contactLivingRoom from '@/assets/images/contact/contact-living-room.webp'

	const { t } = useI18n()

	const form = ref({
		name: '',
		email: '',
		phone: '',
		message: ''
	})

	const consent = ref(false)
	const status = ref('idle')

	// TODO: POST to the Firebase Cloud Function; until it exists nothing is sent and 'error' is unreachable.
	const sendMessage = () => {
		status.value = 'submitting'
		form.value = { name: '', email: '', phone: '', message: '' }
		consent.value = false
		status.value = 'success'
	}

	const methods = [
		{ key: 'email', icon: Mail, lines: ['value'] },
		{ key: 'phone', icon: Phone, lines: ['value', 'hours'] },
		{ key: 'whatsapp', icon: MessageCircle, lines: ['value'] },
		{ key: 'booking', icon: CalendarDays, lines: ['value'] }
	]

	const stepIcons = [Mail, CalendarDays, UserRound, Heart]
	const stripIcons = [Laptop, Clock, Lock, Heart]
</script>

<template>
	<main class="contact-page layout-stack">
		<section class="page-hero">
			<div class="page-hero-content">
				<p class="contact-hero-eyebrow">{{ t('contact.hero.eyebrow') }}</p>
				<h1 class="page-hero-title">{{ t('contact.hero.title') }}</h1>
				<p class="page-hero-intro">{{ t('contact.hero.intro1') }}</p>
				<p class="page-hero-intro">{{ t('contact.hero.intro2') }}</p>
				<a class="button button-primary contact-hero-cta" href="#contact-form">
					<Sprout :size="18" />
					{{ t('contact.hero.cta') }}
				</a>
			</div>

			<div class="contact-hero-media bleed-right">
				<img class="contact-photo media-fade" :src="contactDesk" :alt="t('contact.hero.photoAlt')"
					width="1060" height="707" decoding="async" loading="eager" fetchpriority="high" />

				<aside class="contact-note card">
					<p class="contact-note-item">
						<Sprout :size="24" />
						{{ t('contact.note.sessions') }}
					</p>
					<p class="contact-note-item">
						<Laptop :size="24" />
						{{ t('contact.note.place') }}
					</p>
				</aside>
			</div>
		</section>

		<section class="contact-reach">
			<div class="contact-reach-info">
				<h2 class="contact-reach-title">{{ t('contact.reach.title') }}</h2>
				<p class="contact-reach-subtitle">{{ t('contact.reach.subtitle') }}</p>

				<div v-for="method in methods" :key="method.key" class="contact-method u-text">
					<span class="icon-chip">
						<component :is="method.icon" :size="22" />
					</span>
					<div class="contact-method-body">
						<h3 class="contact-method-label">{{ t(`contact.reach.${method.key}.label`) }}</h3>
						<p v-for="line in method.lines" :key="line" class="contact-method-line">
							{{ t(`contact.reach.${method.key}.${line}`) }}
						</p>
					</div>
				</div>
			</div>

			<form id="contact-form" @submit.prevent="sendMessage" class="contact-form card">
				<h2 class="contact-form-title">{{ t('contact.form.title') }}</h2>
				<p class="contact-form-text">{{ t('contact.form.intro1') }}</p>
				<p class="contact-form-text">{{ t('contact.form.intro2') }}</p>

				<div class="form-row">
					<div class="form-group">
						<input id="contact-name" type="text" v-model="form.name" placeholder=" " required />
						<label for="contact-name">{{ t('contact.form.name') }}</label>
					</div>

					<div class="form-group">
						<input id="contact-email" type="email" v-model="form.email" placeholder=" " required />
						<label for="contact-email">{{ t('contact.form.email') }}</label>
					</div>
				</div>

				<div class="form-group">
					<input id="contact-phone" type="tel" v-model="form.phone" placeholder=" " />
					<label for="contact-phone">{{ t('contact.form.phone') }}</label>
				</div>

				<p class="contact-form-hint">{{ t('contact.form.messageHint') }}</p>

				<div class="form-group">
					<textarea id="contact-message" v-model="form.message" rows="4" placeholder=" " required></textarea>
					<label for="contact-message">{{ t('contact.form.message') }}</label>
				</div>

				<div class="contact-form-consent">
					<input id="contact-consent" v-model="consent" type="checkbox" required />
					<label for="contact-consent">
						{{ t('contact.form.consent') }}
						<RouterLink to="/confidentialitate">{{ t('contact.form.consentLink') }}</RouterLink>.
					</label>
				</div>

				<button type="submit" class="button-primary contact-form-submit" :disabled="status === 'submitting'">
					{{ t('contact.form.send') }}
				</button>

				<p class="contact-form-privacy">
					<Lock :size="16" />
					{{ t('contact.form.privacy') }}
				</p>

				<div v-if="status === 'success'" class="success" role="status">
					{{ t('contact.form.success') }}
				</div>

				<div v-if="status === 'error'" class="error" role="alert">
					{{ t('contact.form.error') }}
				</div>
			</form>
		</section>

		<section class="contact-after">
			<div class="contact-steps card">
				<h2 class="contact-steps-title">{{ t('contact.steps.title') }}</h2>

				<div class="contact-steps-list">
					<div v-for="(icon, index) in stepIcons" :key="index" class="contact-step">
						<span class="icon-chip contact-step-number">{{ index + 1 }}</span>
						<component :is="icon" :size="28" />
						<p class="contact-step-text">{{ t(`contact.steps.s${index + 1}`) }}</p>
					</div>
				</div>
			</div>

			<div class="contact-reassure card">
				<h2 class="contact-reassure-title">{{ t('contact.reassure.title') }}</h2>

				<p v-for="index in 5" :key="index" class="contact-reassure-item">
					<Sprout :size="18" />
					{{ t(`contact.reassure.i${index}`) }}
				</p>

				<p class="contact-reassure-closing">{{ t('contact.reassure.closing') }}</p>
			</div>
		</section>

		<section class="contact-closing section-tight">
			<img class="contact-photo media-fade bleed-left" :src="contactLivingRoom"
				:alt="t('contact.closing.photoAlt')" width="901" height="600" decoding="async" loading="lazy" />

			<div class="contact-closing-content">
				<h2 class="contact-closing-title">{{ t('contact.closing.title') }}</h2>
				<p class="contact-closing-text">{{ t('contact.closing.text') }}</p>

				<div class="contact-closing-banner card">
					<Sprout :size="32" />
					<p class="contact-closing-banner-text">{{ t('contact.closing.banner') }}</p>
					<a class="button button-primary" href="#contact-form">{{ t('contact.closing.cta') }}</a>
				</div>
			</div>
		</section>

		<section class="contact-strip layout-full section-flush">
			<div v-for="(icon, index) in stripIcons" :key="index" class="contact-strip-item">
				<component :is="icon" :size="28" />
				<div>
					<h3 class="contact-strip-title">{{ t(`contact.strip.s${index + 1}.title`) }}</h3>
					<p class="contact-strip-text">{{ t(`contact.strip.s${index + 1}.text`) }}</p>
				</div>
			</div>
		</section>
	</main>
</template>

<style scoped lang="scss">
	.contact-page {
		// the hero photo runs flush to the top, behind the fixed nav
		--page-pad-top: 0;
		--page-pad-bottom: 0;
	}

	// Shared
	.contact-photo {
		width: 100%;
		height: 100%;
		min-width: 0; // without this, min-width:auto floors the flex item at the image's intrinsic width and kills the edge bleed
		min-height: var(--vt-c-media-min-height);
		object-fit: cover;
	}

	// Hero
	.contact-hero-eyebrow {
		margin: 0;
		color: var(--vt-c-jannafer-green);
	}

	.contact-hero-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.contact-hero-media {
		position: relative; // anchors .contact-note
	}

	.contact-note {
		position: absolute;
		top: 7rem; // clears the fixed nav, like the hero copy
		right: 3rem;
		width: 13rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		text-align: center;
	}

	.contact-note-item {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: var(--vt-c-jannafer-green);
	}

	// Reach + form
	.contact-reach {
		display: flex;
		align-items: flex-start;
		gap: var(--vt-c-split-gap);
	}

	.contact-reach-info {
		flex: 1;
	}

	.contact-reach-title,
	.contact-reach-subtitle {
		margin: 0 0 0.5rem;
	}

	.contact-method {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-top: 2rem;
	}

	.contact-method-label {
		margin: 0;
		font-weight: 400;
	}

	.contact-method-line {
		margin: 0;
	}

	.contact-form {
		flex: 0 0 58%;
	}

	.contact-form-title {
		margin: 0 0 1rem;
	}

	.contact-form-text {
		margin: 0 0 0.5rem;
	}

	.contact-form input:not([type="checkbox"]),
	.contact-form textarea {
		width: 100%;
	}

	.contact-form-hint {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}

	.contact-form-consent {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.9rem;

		label {
			cursor: pointer;
		}
	}

	.contact-form-submit {
		width: 100%;
	}

	.contact-form-privacy {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 1rem 0 0;
		font-size: 0.9rem;
	}

	// Steps + reassure
	.contact-after {
		display: flex;
		align-items: stretch;
		gap: 1rem;
	}

	.contact-steps {
		flex: 1;
		margin-left: calc(50% - 50vw); // card bleeds to the viewport edge, text stays on the container
		padding-left: calc(50vw - 50%);
	}

	.contact-steps-title,
	.contact-reassure-title {
		margin: 0 0 2rem;
	}

	.contact-steps-list {
		display: flex;
		gap: 1rem;
		text-align: center;
		color: var(--vt-c-jannafer-green);
	}

	.contact-step {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.contact-step-number {
		font-family: "Libre Baskerville", serif;
	}

	.contact-step-text {
		margin: 0;
		font-size: 0.9rem;
		color: var(--vt-c-black);
	}

	.contact-reassure {
		flex: 1;
	}

	.contact-reassure-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 1rem;

		svg {
			color: var(--vt-c-jannafer-green);
		}
	}

	.contact-reassure-closing {
		margin: 2rem 0 0;
		font-family: "Libre Baskerville", serif;
		color: var(--vt-c-jannafer-green);
	}

	// Closing
	.contact-closing {
		display: flex;
		align-items: center;
		gap: clamp(1.5rem, 0.75rem + 2.4vw, 3rem);
	}

	.contact-closing-content {
		flex: 1;
	}

	.contact-closing-title {
		margin: 0 0 1.5rem;
	}

	.contact-closing-text {
		margin: 0 0 2rem;
	}

	.contact-closing-banner {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		color: var(--vt-c-jannafer-green);
	}

	.contact-closing-banner-text {
		flex: 1;
		margin: 0;
		color: var(--vt-c-black);
	}

	// Bottom strip
	.contact-strip {
		display: flex;
		gap: var(--vt-c-split-gap);
		padding: var(--card-padding) calc(50vw - 50%);
		background: var(--vt-c-surface);
		color: var(--vt-c-jannafer-green);
	}

	.contact-strip-item {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.contact-strip-title {
		margin: 0;
		font-family: "Mulish Variable", sans-serif;
		font-size: 1rem;
	}

	.contact-strip-text {
		margin: 0;
		color: var(--vt-c-black);
		font-size: 0.9rem;
	}

	@media (max-width: 1024px) {
		.contact-strip {
			flex-wrap: wrap;
		}

		.contact-strip-item {
			flex-basis: 40%;
		}
	}

	@media (max-width: 768px) {

		.contact-reach,
		.contact-after,
		.contact-closing {
			flex-direction: column;
			align-items: stretch;
		}

		.contact-steps {
			flex: auto;
			margin-inline: 0;
			padding-left: var(--card-padding);
		}

		.contact-note {
			position: static;
			width: auto;
			flex-direction: row;
			justify-content: center;
			margin-top: 1rem;
		}
	}

	@media (max-width: 480px) {
		.contact-steps-list {
			flex-direction: column;
		}

		.contact-strip-item {
			flex-basis: 100%;
		}
	}
</style>
