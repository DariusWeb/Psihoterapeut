<script setup>
    import { useRoute } from 'vue-router'
    import { computed } from 'vue'
    import { useArticlesStore } from '@/stores/articlesStore'

    const route = useRoute()
    const articlesStore = useArticlesStore()

    const article = computed(() =>
        articlesStore.getArticleById(Number(route.params.id))
    )
</script>

<template>
    <main v-if="article" class="article-detail">
        <img :src="article.image" :alt="article.title">
        <h1>{{ article.title }}</h1>
        <h2>{{ article.subtitle }}</h2>

        <!-- Render the article component -->
        <component :is="article.component" />
    </main>
</template>