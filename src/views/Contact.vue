<script setup>
	import { ref, computed } from 'vue'
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { Sprout, Laptop, Mail, Phone, MessageCircle, CalendarDays, Heart, Lock, Clock, BadgeCheck, Check, CircleAlert, LoaderCircle } from '@lucide/vue'
	import contactDesk from '@/assets/images/contact/contact-desk.webp'
	import contactLivingRoom from '@/assets/images/contact/contact-living-room.webp'
	import { useFormSubmit } from '@/composables/useFormSubmit'
	import { useFormErrorMessage } from '@/composables/useFormErrorMessage'
	import { CONTACT, CONTACT_PARAMS } from '@/contact.config'

	const { t, locale } = useI18n()

	const form = ref({
		name: '',
		email: '',
		phone: '',
		message: ''
	})

	const consent = ref(false)
	const { status, errorCode, captcha, submit } = useFormSubmit('/contact')
	const errorMessage = useFormErrorMessage(errorCode, 'contact.form.error')

	const sendMessage = async () => {
		const sent = await submit({
			...form.value,
			locale: locale.value,
			// the exact wording the visitor agreed to, stored as the consent proof
			consentText: `${t('contact.form.consent')} ${t('contact.form.consentLink')}.`
		})

		if (!sent) return

		form.value = { name: '', email: '', phone: '', message: '' }
		consent.value = false
	}

	// Odd parts are the „quoted” examples, set in serif italic.
	const formExamples = computed(() => t('contact.form.intro2').split(/(„[^”]*”)/))

	const methods = [
		{ key: 'email', icon: Mail, href: `mailto:${CONTACT.email}` },
		{ key: 'phone', icon: Phone, href: `tel:${CONTACT.phone}`, note: 'hours' },
		{ key: 'whatsapp', icon: MessageCircle, href: CONTACT.whatsapp, external: true },
		{ key: 'booking', icon: CalendarDays, to: '/programare' }
	]

	const noteItems = [{ key: 'sessions', icon: Laptop }, { key: 'place', icon: Sprout }]
	const stripIcons = [Sprout, Clock, Lock, Heart]
</script>

<template>
	<main class="bands">
		<section class="hero-grid">
			<div class="hero-grid-text statement">
				<h1 class="statement-title">{{ t('contact.hero.title') }}</h1>
				<p class="text-lead text-pretty">{{ t('contact.hero.intro1') }}</p>
				<p class="contact-hero-intro text-pretty">{{ t('contact.hero.intro2') }}</p>
				<a class="button-primary" href="#contact-form">{{ t('contact.hero.cta') }}</a>
			</div>
			<img class="hero-grid-media contact-photo" :src="contactDesk" :alt="t('contact.hero.photoAlt')"
				width="1060" height="707" decoding="async" loading="eager" fetchpriority="high" />
			<aside class="contact-note">
				<p v-for="item in noteItems" :key="item.key" class="contact-note-item text-balance">
					<span class="contact-circle"><component :is="item.icon" :size="18" /></span>
					{{ t(`contact.note.${item.key}`) }}
				</p>
			</aside>
		</section>

		<section id="contact-form" class="band">
			<div class="split-5-7">
				<div class="sticky-side contact-reach">
					<div class="contact-reach-head">
						<h2 class="section-title">{{ t('contact.reach.title') }}</h2>
						<p>{{ t('contact.reach.subtitle') }}</p>
					</div>
					<div class="contact-methods">
						<component :is="method.to ? RouterLink : 'a'" v-for="method in methods" :key="method.key" class="hover-row"
							:to="method.to" :href="method.href" :target="method.external ? '_blank' : null"
							:rel="method.external ? 'noopener noreferrer' : null">
							<span class="hover-row-label">
								<component :is="method.icon" :size="17" />{{ t(`contact.reach.${method.key}.label`) }}
							</span>
							<span class="hover-row-value text-pretty">{{ t(`contact.reach.${method.key}.value`, CONTACT_PARAMS) }}</span>
							<span v-if="method.note" class="text-small">{{ t(`contact.reach.${method.key}.${method.note}`) }}</span>
						</component>
					</div>
				</div>

				<form class="form-panel contact-form" @submit.prevent="sendMessage">
					<div class="contact-form-head">
						<h3 class="contact-form-title">{{ t('contact.form.title') }}</h3>
						<p class="contact-form-intro text-pretty">
							{{ t('contact.form.intro1') }}
							<component :is="index % 2 ? 'em' : 'span'" v-for="(part, index) in formExamples" :key="index">{{ part }}</component>
						</p>
					</div>

					<div class="form-row">
						<div class="form-group">
							<input id="contact-name" v-model="form.name" type="text" placeholder=" " required autocomplete="given-name" />
							<label for="contact-name">{{ t('contact.form.name') }}</label>
						</div>
						<div class="form-group">
							<input id="contact-email" v-model="form.email" type="email" placeholder=" " required autocomplete="email" />
							<label for="contact-email">{{ t('contact.form.email') }}</label>
						</div>
					</div>

					<div class="form-group">
						<input id="contact-phone" v-model="form.phone" type="tel" placeholder=" " autocomplete="tel" />
						<label for="contact-phone">{{ t('contact.form.phone') }}</label>
					</div>

					<p id="contact-message-hint" class="contact-form-hint text-pretty">{{ t('contact.form.messageHint') }}</p>

					<div class="form-group">
						<textarea id="contact-message" v-model="form.message" rows="4" placeholder=" " required
							aria-describedby="contact-message-hint"></textarea>
						<label for="contact-message">{{ t('contact.form.message') }}</label>
					</div>

					<div class="checkbox-field">
						<input id="contact-consent" v-model="consent" type="checkbox" required />
						<label for="contact-consent">
							{{ t('contact.form.consent') }}
							<RouterLink class="text-link" to="/confidentialitate">{{ t('contact.form.consentLink') }}</RouterLink>.
						</label>
					</div>

					<div ref="captcha" class="contact-form-captcha"></div>

					<div v-if="status === 'success'" class="alert" role="status">
						<span class="alert-icon"><Check :size="17" /></span>
						<p class="alert-text">{{ t('contact.form.success') }}</p>
					</div>

					<div v-else class="contact-form-submit">
						<button type="submit" class="button-primary button-full"
							:aria-busy="status === 'submitting'" :disabled="status === 'submitting'">
							<LoaderCircle v-if="status === 'submitting'" :size="16" class="button-spinner" aria-hidden="true" />
							{{ t('contact.form.send') }}
						</button>
						<p class="form-note">
							<Lock :size="14" aria-hidden="true" />
							{{ t('contact.form.privacy') }}
						</p>
					</div>

					<div v-if="status === 'error'" class="alert alert-error" role="alert">
						<span class="alert-icon"><CircleAlert :size="17" /></span>
						<p class="alert-text">{{ errorMessage }}</p>
					</div>
				</form>
			</div>
		</section>

		<section class="band">
			<div class="split-7-5">
				<div class="contact-steps">
					<h2 class="section-title">{{ t('contact.steps.title') }}</h2>
					<ol v-reveal class="contact-steps-list">
						<li v-for="index in 4" :key="index" class="contact-step">
							<span class="contact-circle contact-step-number">{{ index }}</span>
							<p class="text-pretty">{{ t(`contact.steps.s${index}`) }}</p>
						</li>
					</ol>
				</div>

				<div class="note-card">
					<h3 class="note-card-title">{{ t('contact.reassure.title') }}</h3>
					<ul class="icon-list">
						<li v-for="index in 5" :key="index" class="icon-list-item">
							<BadgeCheck :size="17" />{{ t(`contact.reassure.i${index}`) }}
						</li>
					</ul>
					<p class="note-card-quote text-pretty">{{ t('contact.reassure.closing') }}</p>
				</div>
			</div>
		</section>

		<section class="hero-grid hero-grid-mirrored">
			<img class="hero-grid-media contact-photo" :src="contactLivingRoom" :alt="t('contact.closing.photoAlt')"
				width="901" height="600" decoding="async" loading="lazy" />
			<div class="hero-grid-text statement">
				<h2 class="statement-title text-h1 text-pretty">{{ t('contact.closing.title') }}</h2>
				<p class="contact-closing-text text-pretty">{{ t('contact.closing.text') }}</p>
				<div class="contact-closing-card">
					<p class="heart-line contact-closing-line">{{ t('contact.closing.banner') }}</p>
					<a class="button-primary" href="#contact-form">{{ t('contact.closing.cta') }}</a>
				</div>
			</div>
		</section>

		<section class="band">
			<div v-reveal class="strip">
				<div v-for="(icon, index) in stripIcons" :key="index" class="strip-item">
					<component :is="icon" :size="22" />
					<h3 class="text-strip-title">{{ t(`contact.strip.s${index + 1}.title`) }}</h3>
					<p class="strip-text">{{ t(`contact.strip.s${index + 1}.text`) }}</p>
				</div>
			</div>
		</section>
	</main>
</template>

<style scoped lang="scss">
	.contact-hero-intro {
		max-width: 52ch;
	}

	// Square corners: rounded ones would sit inside the fade.
	.contact-photo {
		border-radius: 0;
	}

	.contact-note {
		grid-column: 3 / 5;
		grid-row: 1;
		place-self: center;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 18px;
		width: 220px;
		padding: 26px 22px;
		border-radius: var(--r-block);
		background: var(--cream);
		box-shadow: var(--shadow-panel);
		text-align: center;
	}

	.contact-note-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-8);
		font-size: var(--fs-body-s);
		line-height: 1.5;
		color: var(--olive-800);
	}

	.contact-circle {
		flex: none;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.contact-reach {
		display: flex;
		flex-direction: column;
		gap: var(--s-24);
	}

	.contact-reach-head {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
	}

	// Rows pad 18 inside their hover wash; the list pulls them back onto the text line.
	.contact-methods {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		margin-inline: -18px;
	}

	.contact-form-head {
		display: flex;
		flex-direction: column;
		gap: var(--s-8);
		margin-bottom: var(--s-8);
	}

	.contact-form-title {
		margin: 0;
	}

	.contact-form-intro {
		line-height: 1.7;

		em {
			font-family: var(--font-serif);
			font-size: var(--fs-body-s);
			color: var(--olive-700);
		}
	}

	.contact-form-hint {
		font-size: var(--fs-small);
		line-height: 1.55;
		color: var(--ink-muted);
	}

	.contact-form textarea {
		min-height: 148px;
	}

	// Empty until a challenge actually renders, so it must not take a gap.
	.contact-form-captcha:empty {
		display: none;
	}

	.contact-form-submit {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding-top: var(--s-4);
	}

	.contact-steps {
		display: flex;
		flex-direction: column;
		gap: var(--s-24);
	}

	.contact-steps-list {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--hairline);
	}

	.contact-step {
		display: grid;
		grid-template-columns: 32px 1fr;
		gap: var(--s-16);
		align-items: start;
		padding: 18px 0;
		border-bottom: 1px solid var(--hairline);

		p {
			padding-top: 3px;
		}
	}

	.contact-step-number {
		width: 32px;
		height: 32px;
		font-family: var(--font-serif);
		font-size: var(--fs-body-s);
		color: var(--olive-700);
	}

	.contact-closing-text {
		max-width: 48ch;
	}

	.contact-closing-card {
		align-self: stretch;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-16);
		padding: 22px var(--s-24);
		border-radius: var(--r-block);
		background: var(--paper);
		box-shadow: var(--shadow-rest);
	}

	.contact-closing-line {
		font-size: var(--fs-body-s);
	}

	@media (max-width: 767px) {
		.contact-note {
			grid-column: 1;
			grid-row: 2;
			gap: var(--s-12);
			width: 260px;
			padding: 18px var(--s-20);
			text-align: left;
		}

		.contact-note-item {
			flex-direction: row;
			gap: var(--s-12);
			font-size: var(--fs-small);
			line-height: 1.45;
		}

		.contact-form textarea {
			min-height: 0;
		}

		.contact-closing-card .button-primary {
			align-self: stretch;
			width: auto;
		}
	}
</style>
