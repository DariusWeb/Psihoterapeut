<script setup>
    import { RouterLink } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { ArrowRight, Clock, Image, Leaf } from '@lucide/vue'
    import { useArticlesStore } from '@/stores/articlesStore'
    import { freeGuides, practicalResources, premiumGuides } from '@/content/resources'
    import CtaBand from '@/components/common/CtaBand.vue'

    const { t } = useI18n()
    const articlesStore = useArticlesStore()
</script>

<template>
    <main class="resources-page layout-stack">
        <section class="page-hero">
            <div class="page-hero-content">
                <h1 class="page-hero-title">{{ t('resources.hero.title') }}</h1>
                <Leaf class="section-flourish" :size="28" />
                <p class="page-hero-intro">{{ t('resources.hero.intro') }}</p>
            </div>

            <div class="page-hero-media media-placeholder media-fade bleed-right" role="img"
                :aria-label="t('resources.hero.imageAlt')">
                <Image :size="40" />
            </div>
        </section>

        <section class="stack">
            <div class="section-head">
                <h2>{{ t('resources.articles.title') }}</h2>

                <RouterLink class="link-arrow" to="/articles">
                    {{ t('resources.articles.viewAll') }}
                    <ArrowRight :size="16" />
                </RouterLink>
            </div>

            <div class="card-grid">
                <article v-for="article in articlesStore.recentArticles" :key="article.id"
                    class="article-card card card-compact card-outlined">
                    <img v-if="article.image" class="card-media media-fade" :src="article.image" :alt="article.title"
                        width="600" height="400" decoding="async" loading="lazy" />
                    <div v-else class="media-placeholder card-media media-fade" role="img" :aria-label="article.title">
                        <Image :size="32" />
                    </div>

                    <p class="article-category">{{ t(`articles.categories.${article.category}`) }}</p>
                    <h3 class="card-title article-title">{{ article.title }}</h3>

                    <p class="meta-row article-meta">
                        <span class="meta-item">
                            <Clock :size="16" />
                            {{ t('resources.articles.readTime', { minutes: article.readTime }) }}
                        </span>

                        <RouterLink class="link-arrow" :to="`/articles/${article.id}`">
                            {{ t('resources.articles.read') }}
                            <ArrowRight :size="16" />
                        </RouterLink>
                    </p>
                </article>
            </div>
        </section>

        <section class="stack card resources-panel">
            <div class="section-head">
                <h2>{{ t('resources.freeGuides.title') }}</h2>
            </div>

            <p class="section-intro">{{ t('resources.freeGuides.intro') }}</p>

            <div class="card-grid">
                <article v-for="guide in freeGuides" :key="guide.key" class="media-card card card-outlined">
                    <div class="media-placeholder media-card-media media-fade" role="img"
                        :aria-label="t(`resources.freeGuides.${guide.key}.imageAlt`)">
                        <Image :size="32" />
                    </div>

                    <div class="media-card-body">
                        <h3 class="card-title">{{ t(`resources.freeGuides.${guide.key}.title`) }}</h3>

                        <button type="button" class="media-card-action">
                            {{ t('resources.freeGuides.download') }}
                        </button>
                    </div>
                </article>
            </div>
        </section>

        <section class="stack card resources-panel">
            <div class="section-head">
                <h2>{{ t('resources.practical.title') }}</h2>
            </div>

            <p class="section-intro">{{ t('resources.practical.intro') }}</p>

            <div class="card-grid resources-practical-grid">
                <article v-for="resource in practicalResources" :key="resource.key"
                    class="media-card card card-outlined">
                    <span v-if="resource.icon" class="icon-chip media-card-media resources-practical-icon">
                        <component :is="resource.icon" :size="28" />
                    </span>
                    <div v-else class="media-placeholder media-card-media media-fade" role="img"
                        :aria-label="t(`resources.practical.${resource.key}.imageAlt`)">
                        <Image :size="32" />
                    </div>

                    <div class="media-card-body">
                        <p class="media-card-label">{{ t(`resources.practical.${resource.key}.label`) }}</p>
                        <h3 class="card-title">{{ t(`resources.practical.${resource.key}.title`) }}</h3>
                        <p class="media-card-text">{{ t(`resources.practical.${resource.key}.duration`) }}</p>

                        <button type="button" class="media-card-action">
                            {{ t(`resources.practical.${resource.key}.action`) }}
                        </button>
                    </div>
                </article>
            </div>
        </section>

        <section class="stack">
            <div class="section-head">
                <h2>{{ t('resources.premium.title') }}</h2>

                <button type="button" class="link-arrow">
                    {{ t('resources.premium.viewAll') }}
                    <ArrowRight :size="16" />
                </button>
            </div>

            <p class="section-intro">{{ t('resources.premium.intro') }}</p>

            <div class="card-grid">
                <article v-for="guide in premiumGuides" :key="guide.key" class="media-card card card-outlined">
                    <div class="media-placeholder media-card-media media-fade" role="img"
                        :aria-label="t(`resources.premium.${guide.key}.imageAlt`)">
                        <Image :size="32" />
                    </div>

                    <div class="media-card-body">
                        <h3 class="card-title">{{ t(`resources.premium.${guide.key}.title`) }}</h3>
                        <p class="media-card-text">{{ t(`resources.premium.${guide.key}.text`) }}</p>
                        <p class="resources-price">{{ t(`resources.premium.${guide.key}.price`) }}</p>

                        <button type="button" class="media-card-action">
                            {{ t('resources.premium.details') }}
                        </button>
                    </div>
                </article>
            </div>
        </section>

        <CtaBand :title="t('resources.cta.title')" :text="t('resources.cta.text')" />
    </main>
</template>

<style scoped lang="scss">
    .resources-page {
        --page-padding: 0 1rem 8rem; // the hero media runs flush to the top, behind the fixed nav
    }

    .resources-panel {
        background: var(--vt-c-jannafer-gray);
    }

    .resources-practical-grid {
        --card-columns: 4;
    }

    .resources-practical-icon {
        width: 5rem;
        height: 5rem;
        align-self: center;
    }

    .article-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .article-category {
        margin: 0;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--vt-c-jannafer-green);
    }

    .article-title {
        flex: 1;
    }

    .article-meta {
        padding-top: 0.75rem;
        border-top: 1px solid var(--vt-c-jannafer-gray2);
    }

    .resources-price {
        margin: 0;
        font-weight: 600;
        color: var(--vt-c-jannafer-green);
    }

    @media (max-width: 1024px) {
        .resources-practical-grid {
            --card-columns: 2;
        }
    }
</style>
