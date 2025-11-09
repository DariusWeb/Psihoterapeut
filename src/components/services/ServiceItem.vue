<script setup>
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()

    const props = defineProps({
        id: Number,
        title: String,
        slug: String,
        image: String,
    })
</script>

<template>
    <article class="service-item" id="{{ slug }}">
        <img class="service-image" :src="image" :alt="title">

        <h3 class="service-title">{{ title }}</h3>

        <div class="service-content">
            <slot></slot>
        </div>
    </article>
</template>

<style lang="scss" scoped>
    .service-item {
        padding: 15px;
        text-align: center;

        .service-title {
            margin-top: 10px;
            font-size: 1.2rem;
            font-weight: 600;
        }

        .service-image {
            display: inline-block;
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
    }
</style>
