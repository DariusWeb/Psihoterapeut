<script setup>
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n();
</script>

<template>
    <div class="page-not-found">
        <h1>{{ t('notFound.title') }}</h1>
        <p>{{ t('notFound.message') }}</p>

        <router-link to="/" class="button primary">
            {{ t('notFound.backToHome') }}
        </router-link>
    </div>
</template>

<style scoped></style>
<style lang="scss" scoped>
    .page-not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
    }
</style>