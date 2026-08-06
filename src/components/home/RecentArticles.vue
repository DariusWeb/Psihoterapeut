<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { ArrowRight, Image, Leaf } from '@lucide/vue'
    import { useArticlesStore } from '@/stores/articlesStore'

    const { t, locale } = useI18n()
    const articlesStore = useArticlesStore()

    const formatDate = (date) => new Date(date).toLocaleDateString(locale.value, {
        day: 'numeric', month: 'long', year: 'numeric'
    })
</script>

<template>
    <section class="stack stack-loose">
        <div class="section-head-center">
            <h2>{{ t('home.resources.title') }}</h2>
            <Leaf class="section-flourish" :size="20" />

            <RouterLink class="link-arrow" to="/articole">
                {{ t('resources.articles.viewAll') }}
                <ArrowRight :size="16" />
            </RouterLink>
        </div>

        <div class="card-grid home-resources-grid">
            <RouterLink v-for="article in articlesStore.homeArticles" :key="article.id" class="home-article"
                :to="`/articole/${article.slug}`">
                <img v-if="article.image" class="home-article-media media-fade" :src="article.image"
                    :alt="article.title" width="600" height="400" decoding="async" loading="lazy" />
                <div v-else class="media-placeholder home-article-media media-fade" role="img"
                    :aria-label="article.title">
                    <Image :size="32" />
                </div>

                <h3 class="home-article-title">{{ article.title }}</h3>

                <p class="home-article-meta">
                    <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
                    &middot;
                    {{ t('resources.articles.readTime', { minutes: article.readTime }) }}
                </p>
            </RouterLink>
        </div>
    </section>
</template>

<style scoped lang="scss">
    .home-resources-grid {
        --card-min: 13rem;
    }

    .home-article {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        color: var(--vt-c-black);

        &:hover {
            text-decoration: none;

            .home-article-title {
                color: var(--vt-c-jannafer-green);
            }
        }
    }

    .home-article-media {
        --vt-c-media-min-height: 0;
        height: 10rem;
        width: 100%;
        object-fit: cover;
        border-radius: var(--vt-c-border-radius);
    }

    .home-article-title {
        margin: 0;
        font-size: 1rem;
        transition: var(--vt-c-transition-speed);
    }

    // opacity rather than a grey token, so it stays readable against both themes' text colour
    .home-article-meta {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.7;
    }
</style>
