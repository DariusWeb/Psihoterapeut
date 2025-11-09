<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()

    const props = defineProps({
        title: String,
        subtitle: String,
        image: String,
        id: Number
    })
</script>

<template>
    <article class="article-item">
        <div class="article-image">
            <img :src="image" :alt="title">
        </div>

        <div class="article-content">
            <h3>{{ title }}</h3>
            <p v-if="subtitle">{{ subtitle }}</p>

            <!-- Slot for flexible content -->
            <div class="article-body">
                <slot></slot>
            </div>

            <RouterLink :to="`/articles/${id}`" class="article-link">
                {{ t('button.readMore') }}
            </RouterLink>
        </div>
    </article>
</template>

<style lang="scss" scoped>
    .article-item {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .article-image {
        height: 200px;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .article-content {
        padding: 1.5rem;
    }

    .article-link {
        display: inline-block;
        margin-top: 1rem;
        color: var(--color-primary);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
</style>