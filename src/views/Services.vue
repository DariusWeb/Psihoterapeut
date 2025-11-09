<script setup>
    import { useI18n } from 'vue-i18n'
    import { useServicesStore } from '@/stores/servicesStore'
    import Service from '@/components/services/Service.vue'

    const servicesStore = useServicesStore()
    const { t } = useI18n()
</script>

<template>
    <section class="services">
        <h1>{{ t('navigation.menu.services') }}</h1>

        <div class="services-list">
            <Service v-for="(service, index) in servicesStore.allServices" :key="index" v-bind="service" />
        </div>
    </section>
</template>

<style lang="scss" scoped>
    .services-list {
        display: flex;
        flex-wrap: wrap;
        gap: 3rem;
        justify-content: center;
    }
</style>
