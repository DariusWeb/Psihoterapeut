<script setup>
    import { ref, computed, watchEffect } from 'vue'
    import { useRoute, RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { Lock, Monitor, Repeat } from '@lucide/vue'
    import { getGroupBySlug } from '@/content/groups'
    import { useFormSubmit } from '@/composables/useFormSubmit'
    import { useFormErrorMessage } from '@/composables/useFormErrorMessage'
    import { applySeo } from '@/utils/seo'
    import NotFound from '@/views/NotFound.vue'

    const route = useRoute()
    const { t } = useI18n()

    const group = computed(() => getGroupBySlug(route.params.slug))
    const titleKey = computed(() => `events.groups.${group.value?.key}`)

    const form = ref({ name: '', email: '', phone: '', message: '' })
    const consent = ref(false)
    const { status, errorCode, captcha, submit } = useFormSubmit('/contact')
    const errorMessage = useFormErrorMessage(errorCode, 'contact.form.error')

    watchEffect(() => {
        if (!group.value) {
            // Without this an unknown slug would serve the list page's title as a soft 404.
            applySeo({ title: t('seo.notFound.title'), description: t('seo.notFound.description'), path: route.path })
            return
        }

        applySeo({
            title: t(`${titleKey.value}.title`),
            description: t(`${titleKey.value}.text`),
            path: route.path
        })
    })

    // ponytail: the group arrives inside the message body rather than as its own field —
    // upgrade to a dedicated Worker route if she ever needs to filter signups by group.
    function signUp() {
        submit({
            ...form.value,
            message: [
                t('events.groups.signup.messagePrefix', { group: t(`${titleKey.value}.title`) }),
                form.value.message
            ].filter(Boolean).join('\n\n'),
            consentText: t('contact.form.consent')
        })
    }
</script>

<template>
    <main v-if="group" class="group-detail layout-stack">
        <section class="stack">
            <h1>{{ t(`${titleKey}.title`) }}</h1>

            <p class="meta-row">
                <span class="meta-item">
                    <Monitor :size="16" />
                    {{ t(`${titleKey}.location`) }}
                </span>
                <span class="meta-item">
                    <Repeat :size="16" />
                    {{ t(`${titleKey}.frequency`) }}
                </span>
            </p>

            <p class="group-detail-intro">{{ t(`${titleKey}.text`) }}</p>

            <component :is="group.component" />
        </section>

        <form id="group-signup" class="group-signup card" @submit.prevent="signUp">
            <h2>{{ t('events.groups.signup.title') }}</h2>
            <p>{{ t('events.groups.signup.intro') }}</p>

            <div class="form-row">
                <div class="form-group">
                    <input id="group-name" v-model="form.name" type="text" placeholder=" " required />
                    <label for="group-name">{{ t('contact.form.name') }}</label>
                </div>

                <div class="form-group">
                    <input id="group-email" v-model="form.email" type="email" placeholder=" " required />
                    <label for="group-email">{{ t('contact.form.email') }}</label>
                </div>
            </div>

            <div class="form-group">
                <input id="group-phone" v-model="form.phone" type="tel" placeholder=" " />
                <label for="group-phone">{{ t('contact.form.phone') }}</label>
            </div>

            <div class="form-group">
                <textarea id="group-message" v-model="form.message" rows="3" placeholder=" "></textarea>
                <label for="group-message">{{ t('events.groups.signup.message') }}</label>
            </div>

            <div class="group-signup-consent">
                <input id="group-consent" v-model="consent" type="checkbox" required />
                <label for="group-consent">
                    {{ t('contact.form.consent') }}
                    <RouterLink to="/confidentialitate">{{ t('contact.form.consentLink') }}</RouterLink>.
                </label>
            </div>

            <div ref="captcha"></div>

            <button type="submit" class="button-primary" :disabled="status === 'submitting'">
                {{ t('events.groups.signup.send') }}
            </button>

            <p class="group-signup-privacy">
                <Lock :size="16" />
                {{ t('contact.form.privacy') }}
            </p>

            <div v-if="status === 'success'" class="success" role="status">
                {{ t('events.groups.signup.success') }}
            </div>

            <div v-if="status === 'error'" class="error" role="alert">
                {{ errorMessage }}
            </div>
        </form>
    </main>

    <NotFound v-else />
</template>

<style scoped lang="scss">
    .group-detail {
        max-width: 800px;
        margin: 0 auto;
    }

    .group-detail-intro {
        font-size: 1.1rem;
    }

    .group-signup-consent {
        display: flex;
        align-items: flex-start;
        gap: .5rem;
        margin: 1rem 0;
    }

    .group-signup-privacy {
        display: flex;
        align-items: center;
        gap: .5rem;
        margin: 1rem 0 0;
        font-size: .85rem;
    }
</style>
