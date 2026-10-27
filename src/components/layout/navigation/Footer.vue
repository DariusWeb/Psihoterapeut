<script setup>
	import { useI18n } from 'vue-i18n'
	import { RouterLink } from 'vue-router'
	import { ArrowRight, Mail, MessageCircle, Phone } from '@lucide/vue'
	import { reopenAnalyticsConsent } from '@/services/analytics'
	import { CONTACT } from '@/contact.config'
	import { SITE } from '@/seo.config'

	const { t } = useI18n()
	const year = new Date().getFullYear()
</script>

<template>
	<footer class="footer">
		<div class="footer-inner">
			<div class="footer-grid">
				<div class="footer-brand">
					<span class="footer-name">{{ SITE.name }}</span>
					<p class="footer-tagline">{{ t('footer.tagline') }}</p>
					<RouterLink to="/programare" class="link-arrow">
						{{ t('navigation.cta.book') }}<ArrowRight :size="17" />
					</RouterLink>
				</div>

				<div class="footer-column footer-column-contact">
					<h3 class="footer-title">{{ t('footer.contact.title') }}</h3>
					<a class="footer-link footer-contact" :href="`tel:${CONTACT.phone}`">
						<Phone :size="17" />{{ t('footer.contact.phone') }}
					</a>
					<a class="footer-link footer-contact" :href="`mailto:${CONTACT.email}`">
						<Mail :size="17" />{{ t('footer.contact.email') }}
					</a>
					<a class="footer-link footer-contact" :href="CONTACT.whatsapp" target="_blank" rel="noopener noreferrer">
						<MessageCircle :size="17" />{{ t('footer.contact.whatsapp') }}
					</a>
				</div>

				<div class="footer-column footer-column-schedule">
					<h3 class="footer-title">{{ t('footer.schedule.title') }}</h3>
					<p class="footer-hours">{{ t('footer.schedule.hours') }}</p>
					<p class="footer-place">{{ t('footer.schedule.place') }}</p>
				</div>

				<div class="footer-column footer-column-info">
					<h3 class="footer-title">{{ t('footer.info.title') }}</h3>
					<RouterLink class="footer-link" to="/termeni">{{ t('footer.info.terms') }}</RouterLink>
					<RouterLink class="footer-link" to="/confidentialitate">{{ t('footer.info.privacy') }}</RouterLink>
					<button type="button" class="footer-link" @click="reopenAnalyticsConsent">
						{{ t('footer.info.analytics') }}
					</button>
				</div>
			</div>

			<p class="footer-copyright">{{ t('footer.copyright', { year, name: SITE.name }) }}</p>
		</div>
	</footer>
</template>

<style lang="scss" scoped>
	.footer {
		background: var(--sand);
	}

	.footer-inner {
		display: flex;
		flex-direction: column;
		gap: var(--s-36);
		max-width: var(--container);
		margin-inline: auto;
		padding: var(--s-64) var(--gutter) 22px;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr 1fr;
		gap: var(--s-36);
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-14);
	}

	.footer-name {
		font-family: var(--font-serif);
		font-size: 21px;
		color: var(--olive-700);
	}

	.footer-tagline {
		max-width: 32ch;
		font-size: var(--fs-body-s);
		line-height: 1.6;
	}

	.footer-column {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-12);
	}

	.footer-title {
		margin: 0;
		font-size: var(--fs-serif-s);
		line-height: var(--lh-body);
		color: var(--olive-700);
	}

	.footer-link {
		height: auto;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink);
		font-size: var(--fs-body-s);
		text-align: start;
		transition: none;

		&:hover {
			background: none;
			color: var(--olive-700);
			text-decoration: underline;
		}

		&[aria-current='page'] {
			font-weight: 700;
			color: var(--olive-800);
			text-decoration: none;
		}
	}

	.footer-contact {
		display: flex;
		align-items: center;
		gap: var(--s-10);

		svg {
			flex: none;
			color: var(--olive-600);
		}
	}

	.footer-hours {
		font-size: var(--fs-body-s);
		line-height: 1.6;
	}

	.footer-place {
		font-size: var(--fs-body-s);
		color: var(--ink-muted);
	}

	.footer-copyright {
		padding-top: 18px;
		border-top: 1px solid var(--line-footer);
		font-size: var(--fs-caption);
		color: var(--ink-muted);
	}

	@media (max-width: 1023px) {
		.footer-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 767px) {
		.footer-inner {
			gap: var(--s-28);
			padding: var(--s-48) var(--gutter) var(--s-20);
		}

		.footer-grid {
			gap: var(--s-28) var(--s-20);
		}

		.footer-brand,
		.footer-column-contact {
			grid-column: 1 / -1;
		}

		.footer-brand {
			gap: var(--s-12);

			.link-arrow {
				min-height: 44px;
			}
		}

		.footer-name {
			font-size: 20px;
		}

		.footer-column-contact {
			gap: var(--s-4);

			.footer-link {
				min-height: 40px;
			}
		}

		.footer-column-schedule {
			gap: var(--s-8);
		}

		.footer-column-info {
			gap: 2px;

			.footer-link {
				display: flex;
				align-items: center;
				min-height: 36px;
				line-height: 1.35;
			}
		}

		.footer-title {
			margin-bottom: var(--s-4);
		}

		.footer-place {
			font-size: var(--fs-small);
		}

		.footer-copyright {
			padding-top: var(--s-16);
		}
	}
</style>
