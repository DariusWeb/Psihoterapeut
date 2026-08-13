<script setup>
	import { computed, onMounted, ref } from 'vue'
	import { useI18n } from 'vue-i18n'
	import { LogOut, Radio } from '@lucide/vue'
	import { authReady, authUser, isAuthConfigured, signIn, signOutUser, watchAuth } from '@/services/auth'
	import LivePanel from '@/components/dashboard/LivePanel.vue'

	const { t } = useI18n()

	const PANELS = [{ key: 'live', icon: Radio, component: LivePanel }]

	const activePanel = ref('live')
	const signInError = ref('')

	const panel = computed(() => PANELS.find((entry) => entry.key === activePanel.value))

	onMounted(watchAuth)

	async function handleSignIn() {
		signInError.value = ''
		try {
			await signIn()
		} catch (error) {
			// a closed popup is the visitor changing their mind, not a failure worth shouting about
			if (error?.code !== 'auth/popup-closed-by-user') signInError.value = t('dashboard.signInError')
		}
	}
</script>

<template>
	<div class="dashboard">
		<p v-if="!authReady" class="dashboard-status">{{ t('dashboard.loading') }}</p>

		<p v-else-if="!isAuthConfigured()" class="dashboard-status error">
			{{ t('dashboard.notConfigured') }}
		</p>

		<section v-else-if="!authUser" class="dashboard-signin card">
			<h1>{{ t('dashboard.title') }}</h1>
			<p>{{ t('dashboard.signInPrompt') }}</p>
			<button class="button button-primary" @click="handleSignIn">
				{{ t('dashboard.signIn') }}
			</button>
			<p v-if="signInError" class="error" role="alert">{{ signInError }}</p>
		</section>

		<template v-else>
			<header class="dashboard-header">
				<h1>{{ t('dashboard.title') }}</h1>
				<div class="dashboard-account">
					<span class="dashboard-email">{{ authUser.email }}</span>
					<button class="button button-outline dashboard-signout" @click="signOutUser">
						<LogOut :size="16" />
						{{ t('dashboard.signOut') }}
					</button>
				</div>
			</header>

			<div class="dashboard-body">
				<nav class="dashboard-nav" :aria-label="t('dashboard.sectionsLabel')">
					<button
						v-for="entry in PANELS"
						:key="entry.key"
						class="dashboard-nav-item"
						:class="{ active: entry.key === activePanel }"
						:aria-current="entry.key === activePanel ? 'page' : undefined"
						@click="activePanel = entry.key"
					>
						<component :is="entry.icon" :size="18" />
						{{ t(`dashboard.panels.${entry.key}`) }}
					</button>
				</nav>

				<component :is="panel.component" class="dashboard-panel" />
			</div>
		</template>
	</div>
</template>

<style lang="scss" scoped>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: var(--vt-c-section-gap);
	}

	.dashboard-status {
		padding: var(--card-padding);
		text-align: center;
	}

	.dashboard-signin {
		max-width: 26rem;
		margin-inline: auto;
		padding: var(--card-padding);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	// headings carry a large inherited margin that doubles up with the flex gap
	.dashboard-signin h1,
	.dashboard-signin p {
		margin: 0;
	}

	.dashboard-header {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--vt-c-jannafer-gray2);
	}

	.dashboard-header h1 {
		margin: 0;
	}

	.dashboard-account {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.dashboard-email {
		font-size: 0.9rem;
		opacity: 0.75;
	}

	.dashboard-signout {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.dashboard-body {
		display: grid;
		grid-template-columns: minmax(10rem, 14rem) 1fr;
		gap: var(--vt-c-split-gap);
		align-items: start;
	}

	.dashboard-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.dashboard-nav-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.7rem 0.9rem;
		border: none;
		border-radius: var(--vt-c-border-radius);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
		transition: background-color var(--vt-c-transition-speed);
	}

	.dashboard-nav-item:hover {
		background: var(--vt-c-jannafer-gray);
	}

	.dashboard-nav-item.active {
		background: var(--vt-c-jannafer-gray2);
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.dashboard-body {
			grid-template-columns: 1fr;
		}

		.dashboard-nav {
			flex-direction: row;
			overflow-x: auto;
		}
	}
</style>
