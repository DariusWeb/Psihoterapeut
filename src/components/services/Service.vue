<script setup>
    const props = defineProps({
        id: Number,
        title: String,
        subtitle: String,
        image: String,
        component: [Object, String]
    })
</script>

<template>
    <article class="service-detail">
        <img :src="image" :alt="title" />

        <div class="service-content">
            <h2>{{ title }}</h2>
            <h3>{{ subtitle }}</h3>
            <component :is="component" v-if="component" />
        </div>
    </article>
</template>

<style scoped lang="scss">
    .service-detail {
        display: flex;
        align-content: center;
        gap: 1.5rem;
        max-width: 800px;

        img {
            max-width: 300px;
            max-height: 300px;
            object-fit: cover;
        }

        &:nth-child(even) {
            flex-direction: row-reverse;
        }
    }
</style>