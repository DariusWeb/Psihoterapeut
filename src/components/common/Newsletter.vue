<script setup>
    import { ref } from 'vue'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()
    const email = ref('')

    const handleSubmit = () => {
        if (email.value && consent.value) {
            email.value = ''
        }
    }
</script>

<template>
    <div class="newsletter layout-full">
        <div class="newsletter-outer">
            <h3>{{ t('newsletter.title') }}</h3>
            <p>{{ t('newsletter.description') }}</p>

            <form @submit.prevent="handleSubmit" class="newsletter-form">
                <input v-model="email" type="email" :placeholder="t('newsletter.emailPlaceholder')" required>

                <button type="submit">
                    {{ t('button.subscribe') }}
                </button>
            </form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .newsletter {
        padding: 5rem;
        background: var(--vt-c-jannafer-gray);
    }

    .newsletter-outer {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: 0 auto;

        .newsletter-form {
            background: transparent;
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        input {
            width: 100%;
            border-radius: 10rem;
        }
    }
</style>