<script setup>
	import { RouterLink } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	import { BadgeCheck } from '@lucide/vue'
	import andreeaPortrait from '@/assets/images/about/andreea-portrait.webp'
	import { WORK_PRINCIPLE_ICONS } from '@/content/workPrinciples'

	const { t, tm, rt } = useI18n()
</script>

<template>
	<main class="bands">
		<section class="hero-grid">
			<div class="hero-grid-text statement">
				<h1 class="statement-title">{{ t('about.hero.title') }}</h1>
				<p class="text-lead text-pretty">{{ t('about.hero.intro1') }}</p>
				<p class="about-hero-intro text-pretty">{{ t('about.hero.intro2') }}</p>
				<RouterLink class="button-primary" to="/programare">{{ t('about.hero.cta') }}</RouterLink>
			</div>
			<img class="hero-grid-media about-hero-photo" :src="andreeaPortrait" :alt="t('about.hero.photoAlt')"
				width="1050" height="700" decoding="async" loading="eager" fetchpriority="high" />
		</section>

		<section class="band">
			<div class="about-split">
				<div class="about-column">
					<h2 class="section-title">{{ t('about.story.title') }}</h2>
					<p class="text-pretty">{{ t('about.story.p1') }}</p>
					<p class="text-pretty">{{ t('about.story.p2') }}</p>
				</div>
				<div class="about-column about-aside">
					<div class="about-thoughts">
						<h3 class="about-thoughts-title">{{ t('about.story.thoughts.title') }}</h3>
						<p v-for="thought in tm('about.story.thoughts.items')" :key="rt(thought)" class="quote-row text-pretty">
							{{ rt(thought) }}
						</p>
					</div>
					<p class="text-pretty">{{ t('about.story.p4') }}</p>
				</div>
			</div>
		</section>

		<section class="band">
			<div class="about-split">
				<div class="about-column sticky-side">
					<h2 class="section-title">{{ t('about.journey.title') }}</h2>
					<p class="text-lead text-pretty about-journey-lead">{{ t('about.journey.p1') }}</p>
					<p class="text-pretty">{{ t('about.journey.p2') }}</p>
					<ul class="icon-list about-credentials">
						<li v-for="credential in tm('services.credentials')" :key="rt(credential)" class="icon-list-item">
							<BadgeCheck :size="17" />{{ rt(credential) }}
						</li>
					</ul>
				</div>
				<ol class="about-aside about-timeline">
					<li v-for="step in tm('about.journey.timeline')" :key="rt(step.title)" class="about-step">
						<span class="about-step-dot" aria-hidden="true"></span>
						<div class="about-step-body">
							<span class="text-eyebrow">{{ rt(step.label) }}</span>
							<h3 class="about-step-title">{{ rt(step.title) }}</h3>
							<p class="text-pretty">{{ rt(step.text) }}</p>
						</div>
					</li>
				</ol>
			</div>
		</section>

		<section id="cum-lucrez" class="band">
			<div class="split-7-5">
				<div class="about-column">
					<h2 class="section-title">{{ t('about.work.title') }}</h2>
					<div class="about-paragraphs">
						<p class="text-pretty">{{ t('about.work.p1') }}</p>
						<p class="text-pretty">{{ t('about.work.p2') }}</p>
						<p class="text-pretty">{{ t('about.work.p3') }}</p>
						<p class="text-pretty">{{ t('about.work.p4') }}</p>
					</div>
				</div>
				<div v-reveal class="sticky-side about-principles">
					<div v-for="(item, index) in tm('home.work.items')" :key="rt(item.title)" class="about-principle">
						<component :is="WORK_PRINCIPLE_ICONS[index]" :size="22" />
						<h3 class="text-strip-title">{{ rt(item.title) }}</h3>
						<p class="strip-text">{{ rt(item.text) }}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="band">
			<div class="split-5-7">
				<div class="about-column">
					<h2 class="section-title">{{ t('about.therapy.title') }}</h2>
					<div class="about-paragraphs">
						<p class="text-pretty">{{ t('about.therapy.p1') }}</p>
						<p class="text-pretty">{{ t('about.therapy.p2') }}</p>
					</div>
				</div>
				<div class="note-card">
					<h3 class="note-card-title text-pretty">{{ t('about.therapy.moment.title') }}</h3>
					<p class="about-moment-text text-pretty">{{ t('about.therapy.moment.p1') }}</p>
					<p class="note-card-quote text-pretty">{{ t('about.therapy.moment.p2') }}</p>
					<RouterLink class="button-primary about-moment-button" to="/programare">{{ t('about.hero.cta') }}</RouterLink>
					<p class="heart-line">{{ t('cta.note') }}</p>
				</div>
			</div>
		</section>
	</main>
</template>

<style lang="scss" scoped>
	.about-hero-intro {
		max-width: 52ch;
	}

	// Square corners: rounded ones would sit inside the fade.
	.about-hero-photo {
		border-radius: 0;
		object-position: 50% 15%;
	}

	.about-split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 72px;
		align-items: start;
	}

	.about-column {
		display: flex;
		flex-direction: column;
		gap: var(--s-24);
	}

	// Lines the side column up with the first paragraph: the heading's 35 plus the column gap.
	.about-aside {
		display: flex;
		flex-direction: column;
		gap: var(--s-28);
		padding-top: 59px;
	}

	.about-journey-lead {
		max-width: none;
	}

	.about-paragraphs {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
	}

	.about-thoughts {
		display: flex;
		flex-direction: column;
		padding: 22px 26px var(--s-10);
		border-radius: var(--r-block);
		background: var(--paper);
		box-shadow: var(--shadow-rest);
	}

	.about-thoughts-title,
	.about-step-title {
		margin: 0;
		font-size: var(--fs-h4);
		line-height: var(--lh-h4);
	}

	.about-thoughts-title {
		margin-bottom: var(--s-10);
	}

	.about-credentials {
		padding: var(--s-24);
		border: 1px solid var(--line-card);
		border-radius: var(--r-block);
		background: var(--paper);
	}

	.about-timeline {
		gap: 0;
		margin: 0;
		padding-inline: 0;
		list-style: none;
	}

	.about-step {
		display: grid;
		grid-template-columns: 22px 1fr;
		column-gap: var(--s-20);

		&:not(:last-child) .about-step-body {
			padding-bottom: var(--s-36);
		}

		// The line runs from under the dot to the next step; the last step has none.
		&:not(:last-child)::after {
			content: '';
			grid-column: 1;
			grid-row: 1;
			justify-self: center;
			width: 1.5px;
			margin-top: 28px;
			background: var(--line-field);
		}
	}

	.about-step-dot {
		grid-column: 1;
		grid-row: 1;
		justify-self: center;
		width: 11px;
		height: 11px;
		margin-top: 7px;
		border-radius: 50%;
		background: var(--olive-600);
		box-shadow: 0 0 0 5px var(--olive-tint);
	}

	.about-step-body {
		grid-column: 2;
		grid-row: 1;
		display: flex;
		flex-direction: column;
		gap: var(--s-8);
	}

	.about-principles {
		display: grid;
		margin-top: 59px;
	}

	.about-principle {
		display: grid;
		grid-template-columns: 22px 1fr;
		gap: var(--s-8) var(--s-12);
		align-items: start;
		padding: var(--s-20) 0;
		border-top: 1px solid var(--hairline);

		&:first-child {
			padding-top: 0;
			border-top: 0;
		}

		> svg {
			color: var(--olive-600);
		}
	}

	.about-moment-text {
		font-size: var(--fs-body-s);
		line-height: 1.6;
	}

	.about-moment-button {
		margin-top: var(--s-8);
	}

	// No fade on phones, so the photo gets its rounded corners back.
	@media (max-width: 767px) {
		.about-hero-photo {
			height: 320px;
			border-radius: var(--r-block) 0 0 var(--r-block);
		}

		.about-split {
			grid-template-columns: 1fr;
			gap: var(--s-24);
		}

		.about-column {
			gap: var(--s-16);

			> .section-title {
				margin-bottom: var(--s-8);
			}

			> .icon-list {
				margin-top: var(--s-8);
			}
		}

		.about-thoughts {
			padding: 22px 22px var(--s-10);
		}

		.about-journey-lead {
			font-size: var(--fs-body);
			line-height: var(--lh-body);
		}

		.about-credentials {
			padding: 0;
			border: 0;
			background: none;
		}

		.about-aside {
			gap: var(--s-24);
			padding-top: 0;
		}

		.about-timeline {
			gap: 0;
			border-top: 1px solid var(--hairline);
		}

		.about-step {
			display: block;
			padding: 18px 0;
			border-bottom: 1px solid var(--hairline);

			&:not(:last-child) .about-step-body {
				padding-bottom: 0;
			}

			&::after,
			.about-step-dot {
				display: none;
			}

			.text-eyebrow {
				font-size: var(--fs-caption);
				font-weight: 700;
				letter-spacing: 0.02em;
				text-transform: none;
				color: var(--olive-700);
			}

			p {
				font-size: var(--fs-body-s);
				line-height: 1.6;
			}
		}

		.about-step-body {
			gap: var(--s-6);
		}

		.about-moment-button {
			margin-top: 0;
		}

		.about-principles {
			margin-top: 0;
			border-top: 1px solid var(--hairline);
		}

		.about-principle,
		.about-principle:first-child {
			gap: var(--s-6) var(--s-12);
			padding: var(--s-16) 0;
			border-top: 0;
			border-bottom: 1px solid var(--hairline);
		}
	}
</style>
