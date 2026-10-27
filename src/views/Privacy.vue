<script setup>
	import { computed } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { Activity, Calendar, CalendarCheck, Check, Heart, Lock, Mail, MonitorSmartphone, Newspaper, ShoppingBag } from '@lucide/vue'
	import LegalContents from '@/components/common/LegalContents.vue'
	import { CONTACT } from '@/contact.config'

	const { t } = useI18n()

	const SECTION_KEYS = ['controller', 'collect', 'health', 'basis', 'sharing', 'retention', 'rights', 'security', 'changes']
	const sections = computed(() => SECTION_KEYS.map((key) => ({ key, id: `privacy-${key}`, title: t(`privacy.${key}.title`) })))

	const COLLECT_TILES = [
		{ key: 'form', icon: Mail, paragraphs: ['body'] },
		{ key: 'booking', icon: CalendarCheck, paragraphs: ['body'] },
		{ key: 'purchase', icon: ShoppingBag, paragraphs: ['body'] },
		{ key: 'likes', icon: Heart, paragraphs: ['body'] },
		{ key: 'newsletter', icon: Newspaper, paragraphs: ['body', 'tracking'] },
		{ key: 'analytics', icon: Activity, paragraphs: ['body', 'processor', 'identity', 'withdraw'] },
		{ key: 'storage', icon: MonitorSmartphone, paragraphs: ['body'] },
	]
	const STORAGE_KEYS = ['theme', 'language', 'consent', 'live', 'likes']
	const BASIS_KEYS = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6']
	const RETENTION_KEYS = ['i1', 'i2', 'i4', 'i5']

	// The part before the separator is bold (basis keeps the dash, retention bolds the colon).
	const splitAt = (text, separator, keepInLead) => {
		const at = text.indexOf(separator)
		const cut = keepInLead ? at + separator.length : at
		return [text.slice(0, cut), text.slice(cut)]
	}
	const basisRows = computed(() => BASIS_KEYS.map((key) => splitAt(t(`privacy.basis.${key}`), ' — ', false)))
	const retentionRows = computed(() => RETENTION_KEYS.map((key) => splitAt(t(`privacy.retention.${key}`), ':', true)))
	const storageRows = computed(() => STORAGE_KEYS.map((key) => t(`privacy.collect.storage.${key}`).split(' — ')))
	const providers = computed(() =>
		[1, 2, 3, 4, 5].map((index) => t(`privacy.sharing.i${index}`).match(/^(.+?) \((.+?)\) (.+)$/).slice(1))
	)
	const complaintParts = computed(() => t('privacy.rights.complaint').split('dataprotection.ro'))
</script>

<template>
	<main class="bands u-text">
		<div class="band legal-page">
			<div class="statement">
				<h1 class="statement-title">{{ t('privacy.title') }}</h1>
				<p class="text-lead legal-page-intro text-pretty">{{ t('privacy.intro') }}</p>
				<p class="text-small legal-page-updated"><Calendar :size="15" aria-hidden="true" />{{ t('privacy.updated') }}</p>
			</div>

			<div class="legal-layout">
				<LegalContents class="sticky-side" :sections="sections" />

				<div class="legal-body">
					<section v-for="(section, index) in sections" :id="section.id" :key="section.key" class="legal-section"
						tabindex="-1">
						<h2 class="legal-title">
							<span class="legal-number">{{ String(index + 1).padStart(2, '0') }}</span>{{ section.title }}
						</h2>

						<template v-if="section.key === 'controller'">
							<p class="text-pretty">{{ t('privacy.controller.body') }}</p>
							<p class="text-pretty">
								<i18n-t keypath="privacy.controller.contact" tag="span" scope="global">
									<template #email><a class="text-link" :href="`mailto:${CONTACT.email}`">{{ CONTACT.email }}</a></template>
								</i18n-t>
							</p>
						</template>

						<template v-else-if="section.key === 'collect'">
							<p class="text-pretty">{{ t('privacy.collect.intro') }}</p>
							<div class="privacy-tiles">
								<div v-for="tile in COLLECT_TILES" :key="tile.key" class="privacy-tile">
									<h3 class="privacy-tile-title">
										<span class="privacy-tile-icon"><component :is="tile.icon" :size="17" aria-hidden="true" /></span>
										{{ t(`privacy.collect.${tile.key}.title`) }}
									</h3>
									<p v-for="paragraph in tile.paragraphs" :key="paragraph" class="text-pretty">
										{{ t(`privacy.collect.${tile.key}.${paragraph}`) }}
									</p>
									<template v-if="tile.key === 'storage'">
										<ul class="hairline-rows privacy-storage">
											<li v-for="[name, text] in storageRows" :key="name" class="hairline-row">
												<code>{{ name }}</code><span>{{ text }}</span>
											</li>
										</ul>
										<p class="text-pretty">{{ t('privacy.collect.storage.life') }}</p>
									</template>
								</div>
							</div>
						</template>

						<ul v-else-if="section.key === 'basis'" class="hairline-rows">
							<li v-for="[lead, rest] in basisRows" :key="lead" class="hairline-row text-pretty"><b>{{ lead }}</b>{{ rest }}</li>
						</ul>

						<template v-else-if="section.key === 'sharing'">
							<p class="text-pretty">{{ t('privacy.sharing.body') }}</p>
							<ul class="hairline-rows">
								<li v-for="[name, entity, text] in providers" :key="name" class="hairline-row privacy-provider">
									<span class="privacy-provider-name">
										<span class="text-serif-s">{{ name }}</span>
										<span class="text-caption">{{ entity }}</span>
									</span>
									<span class="text-pretty">{{ text }}</span>
								</li>
							</ul>
							<p class="text-pretty">{{ t('privacy.sharing.transfers') }}</p>
							<p class="text-pretty">{{ t('privacy.sharing.note') }}</p>
						</template>

						<template v-else-if="section.key === 'retention'">
							<ul class="hairline-rows">
								<li v-for="[lead, rest] in retentionRows" :key="lead" class="hairline-row text-pretty"><b>{{ lead }}</b>{{ rest }}</li>
							</ul>
							<p class="privacy-note">
								<span class="alert-icon"><Lock :size="17" aria-hidden="true" /></span>
								<span class="privacy-note-text text-pretty">{{ t('privacy.retention.i3') }}</span>
							</p>
						</template>

						<template v-else-if="section.key === 'rights'">
							<p class="text-pretty">{{ t('privacy.rights.intro') }}</p>
							<ul class="icon-list privacy-rights">
								<li v-for="item in 6" :key="item" class="icon-list-item">
									<Check :size="17" aria-hidden="true" />{{ t(`privacy.rights.i${item}`) }}
								</li>
							</ul>
							<p class="text-pretty">{{ t('privacy.rights.response') }}</p>
							<p class="text-pretty">
								{{ complaintParts[0] }}<a class="text-link" href="https://www.dataprotection.ro" target="_blank"
									rel="noopener">dataprotection.ro</a>{{ complaintParts[1] }}
							</p>
						</template>

						<p v-else class="text-pretty">{{ t(`privacy.${section.key}.body`) }}</p>
					</section>
				</div>
			</div>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	.privacy-tiles {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding-top: var(--s-8);
	}

	.privacy-tile {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding: var(--card-pad);
		border: 1px solid var(--line-card);
		border-radius: var(--r-block);
		background: var(--paper);
	}

	.privacy-tile-title {
		display: flex;
		align-items: center;
		gap: var(--s-12);
		margin: 0;
		font-size: var(--fs-h4);
		line-height: var(--lh-h4);
	}

	.privacy-tile-icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.privacy-storage .hairline-row {
		display: grid;
		grid-template-columns: 184px minmax(0, 1fr);
		gap: var(--s-16);
		align-items: baseline;

		code {
			justify-self: start;
		}
	}

	.privacy-provider {
		display: grid;
		grid-template-columns: 168px minmax(0, 1fr);
		gap: var(--s-20);
	}

	.privacy-provider-name {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.privacy-note {
		display: grid;
		grid-template-columns: 32px minmax(0, 1fr);
		gap: var(--s-12);
		align-items: start;
		margin-top: var(--s-8);
		padding: var(--s-16) 22px;
		border-radius: var(--r-row);
		background: var(--sand);
	}

	.privacy-note-text {
		padding-top: 3px;
	}

	.privacy-rights {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--s-10) var(--s-28);
	}

	@media (max-width: 767px) {
		.privacy-storage .hairline-row,
		.privacy-provider,
		.privacy-rights {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-6);
		}

		.privacy-rights {
			gap: var(--s-10);
		}
	}
</style>
