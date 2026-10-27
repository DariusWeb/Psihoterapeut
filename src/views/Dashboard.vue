<script setup>
	import { computed, onMounted, ref } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { CircleAlert, LoaderCircle, LockKeyhole, LogOut, Radio } from '@lucide/vue'
	import { authReady, authUser, isAuthConfigured, signIn, signOutUser, watchAuth } from '@/services/auth'
	import LivePanel from '@/components/dashboard/LivePanel.vue'

	const { t } = useI18n()

	const PANELS = [{ key: 'live', icon: Radio, component: LivePanel }]

	const activePanel = ref('live')
	const signInError = ref('')
	const signingIn = ref(false)

	const panel = computed(() => PANELS.find((entry) => entry.key === activePanel.value))

	onMounted(watchAuth)

	async function handleSignIn() {
		signInError.value = ''
		signingIn.value = true
		try {
			await signIn()
		} catch (error) {
			// a closed popup is the visitor changing their mind, not a failure worth shouting about
			if (error?.code !== 'auth/popup-closed-by-user') signInError.value = t('dashboard.signInError')
		} finally {
			signingIn.value = false
		}
	}
</script>

<template>
	<main class="bands">
		<div class="band dashboard">
			<template v-if="!authReady">
				<p class="dashboard-hidden" role="status">{{ t('dashboard.loading') }}</p>
				<div class="dashboard-signed-in skeleton" aria-hidden="true">
					<div class="dashboard-header">
						<span class="bone bone-header bone-title"></span>
						<div class="dashboard-account">
							<span class="bone bone-header bone-email"></span>
							<span class="bone bone-header bone-button"></span>
						</div>
					</div>
					<div class="dashboard-body">
						<span class="bone bone-header bone-pill"></span>
						<div class="dashboard-skeleton-panel">
							<span class="bone bone-heading"></span>
							<span class="bone bone-state"></span>
							<div class="dashboard-skeleton-fields">
								<span class="bone bone-pill"></span>
								<span class="bone bone-pill"></span>
								<div class="dashboard-skeleton-row">
									<span class="bone bone-pill"></span>
									<span class="bone bone-pill"></span>
								</div>
							</div>
							<span class="bone bone-pill bone-submit"></span>
						</div>
					</div>
				</div>
			</template>

			<div v-else-if="!isAuthConfigured()" class="dashboard-center">
				<div class="alert alert-error dashboard-alert" role="alert">
					<span class="alert-icon"><CircleAlert :size="17" aria-hidden="true" /></span>
					<p class="alert-text">{{ t('dashboard.notConfigured') }}</p>
				</div>
			</div>

			<div v-else-if="!authUser" class="dashboard-center">
				<section class="dashboard-signin">
					<span class="dashboard-signin-icon"><LockKeyhole :size="20" aria-hidden="true" /></span>
					<div class="dashboard-signin-copy">
						<h1>{{ t('dashboard.title') }}</h1>
						<p class="text-pretty">{{ t('dashboard.signInPrompt') }}</p>
					</div>
					<div class="dashboard-signin-actions">
						<button type="button" class="button-primary button-full" :aria-busy="signingIn" :disabled="signingIn"
							@click="handleSignIn">
							<LoaderCircle v-if="signingIn" class="button-spinner" :size="16" aria-hidden="true" />
							{{ t('dashboard.signIn') }}
						</button>
						<p v-if="signInError" class="dashboard-signin-error" role="alert">
							<CircleAlert :size="16" aria-hidden="true" />{{ signInError }}
						</p>
					</div>
				</section>
			</div>

			<div v-else class="dashboard-signed-in">
				<header class="dashboard-header">
					<h1>{{ t('dashboard.title') }}</h1>
					<div class="dashboard-account">
						<span class="text-small">{{ authUser.email }}</span>
						<button type="button" class="button-outline" @click="signOutUser">
							<LogOut :size="16" aria-hidden="true" />
							{{ t('dashboard.signOut') }}
						</button>
					</div>
				</header>

				<div class="dashboard-body">
					<nav class="dashboard-nav sticky-side" :aria-label="t('dashboard.sectionsLabel')">
						<button v-for="entry in PANELS" :key="entry.key" type="button" class="dashboard-nav-item"
							:aria-current="entry.key === activePanel ? 'page' : undefined" @click="activePanel = entry.key">
							<component :is="entry.icon" :size="18" aria-hidden="true" />
							{{ t(`dashboard.panels.${entry.key}`) }}
						</button>
					</nav>

					<component :is="panel.component" />
				</div>
			</div>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	.dashboard {
		gap: 0;
		min-height: 640px;
	}

	.dashboard-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.dashboard-center {
		flex: 1;
		display: grid;
		place-items: center;
	}

	.dashboard-alert {
		max-width: 520px;
	}

	.dashboard-signin {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-24);
		width: min(440px, 100%);
		padding: 40px var(--s-32) var(--s-32);
		border: 1px solid var(--line-card);
		border-radius: var(--r-card);
		background: var(--paper);
		box-shadow: var(--shadow-rest);
		text-align: center;
	}

	.dashboard-signin-icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.dashboard-signin-copy {
		display: flex;
		flex-direction: column;
		gap: var(--s-10);

		h1 {
			margin: 0;
			text-align: center;
		}
	}

	.dashboard-signin-actions {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		width: 100%;
	}

	.dashboard-signin-error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-8);
		padding: var(--s-10) var(--s-16);
		border-radius: var(--r-pill);
		background: var(--rose-tint);
		font-size: var(--fs-small);
		line-height: 1.5;
		color: var(--rose-700);

		svg {
			flex: none;
			color: var(--rose);
		}
	}

	.dashboard-signed-in {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.dashboard-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-16);
		padding-bottom: var(--s-24);
		border-bottom: 1px solid var(--hairline);

		h1 {
			margin: 0;
		}
	}

	.dashboard-account {
		display: flex;
		align-items: center;
		gap: var(--s-16);
	}

	.dashboard-body {
		display: grid;
		grid-template-columns: 224px minmax(0, 1fr);
		gap: var(--s-56);
		align-items: start;
	}

	.dashboard-nav {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.dashboard-nav-item {
		display: flex;
		align-items: center;
		gap: var(--s-10);
		height: var(--control-h);
		padding: 0 var(--s-16);
		border-radius: var(--r-pill);
		background: transparent;
		font-size: var(--fs-body-s);
		text-align: left;
		color: var(--ink);
		transition: background-color var(--t-color);

		&:hover {
			background: var(--sand);
			color: var(--ink);
		}

		&[aria-current] {
			background: var(--olive-tint);
			font-weight: 700;
			color: var(--olive-800);
		}
	}

	// Placeholder bones mirror the signed-in layout so nothing jumps when auth resolves.
	.bone {
		display: block;
		border-radius: var(--r-pill);
		background: var(--sand);
	}

	.bone-header {
		background: var(--line-card);
	}

	.bone-title {
		width: 300px;
		height: 41px;
		border-radius: 12px;
	}

	.bone-email {
		width: 240px;
		height: 14px;
	}

	.bone-button {
		width: 142px;
		height: var(--control-h);
	}

	.bone-pill {
		height: var(--control-h);
	}

	.bone-heading {
		width: 200px;
		height: 35px;
		border-radius: 10px;
	}

	.bone-state {
		height: 68px;
		border-radius: var(--r-row);
	}

	.bone-submit {
		width: 128px;
		background: var(--olive-tint);
	}

	.dashboard-skeleton-panel {
		display: flex;
		flex-direction: column;
		gap: var(--s-28);
		padding: var(--panel-pad);
		border: 1px solid var(--line-card);
		border-radius: var(--r-card);
		background: var(--paper);
	}

	.dashboard-skeleton-fields {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
	}

	.dashboard-skeleton-row {
		display: flex;
		gap: var(--s-16);

		.bone {
			flex: 1;
		}
	}

	// Below 1024 the side menu would squeeze the panel, so its pills move above it.
	@media (max-width: 1023px) {
		.dashboard-body {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-24);
		}

		.dashboard-nav {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	@media (max-width: 767px) {
		.dashboard-account {
			flex-wrap: wrap;
		}
	}
</style>
