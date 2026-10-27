<script setup>
    import { computed, onMounted, ref } from 'vue'
    import { RouterLink, useRoute, useRouter } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import { ArrowRight, Download, Image } from '@lucide/vue'
    import { useArticlesStore } from '@/stores/articlesStore'
    import { freeGuides, practicalResources, premiumGuides } from '@/content/resources'
    import { formatPrice, loadCatalogue, priceOf } from '@/services/resources'
    import CtaBand from '@/components/common/CtaBand.vue'
    import ResourceCheckout from '@/components/resources/ResourceCheckout.vue'

    const { t, locale } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const articlesStore = useArticlesStore()

    const checkoutKey = ref(null)
    const sessionId = ref(route.query.session_id ?? null)

    // The all-articles tile fills whatever is left of the last row of three.
    const allTileSpan = computed(() => 3 - (articlesStore.recentArticles.length % 3))

    const formatDate = (date) => new Date(date).toLocaleDateString(locale.value, {
        day: 'numeric', month: 'long', year: 'numeric'
    })

    onMounted(loadCatalogue)

    // Dropped from the URL so a refresh does not re-run the payment check on a spent session.
    function closeCheckout() {
        checkoutKey.value = null
        if (sessionId.value) router.replace({ query: {} })
        sessionId.value = null
    }
</script>

<template>
    <main class="bands">
        <section class="hero-grid">
            <div class="hero-grid-text statement">
                <h1 class="statement-title">{{ t('resources.hero.title') }}</h1>
                <p class="text-lead text-pretty">{{ t('resources.hero.intro') }}</p>
            </div>
            <div class="hero-grid-media media-placeholder resources-hero-placeholder" role="img"
                :aria-label="t('resources.hero.imageAlt')">
                <Image :size="40" />
            </div>
        </section>

        <section id="articole" class="band">
            <div class="resources-head">
                <h2 class="section-title">{{ t('resources.articles.title') }}</h2>
                <p class="text-pretty">{{ t('resources.articles.intro') }}</p>
            </div>
            <div v-reveal:cards class="grid-3 resources-articles">
                <RouterLink v-for="article in articlesStore.recentArticles" :key="article.id"
                    class="paper-card paper-card-link" :to="`/articole/${article.slug}`">
                    <img v-if="article.image" class="paper-card-media" :src="article.image"
                        :alt="article.imageAlt ?? article.title" width="600" height="400" decoding="async" loading="lazy" />
                    <div v-else class="paper-card-media" role="img" :aria-label="article.title"></div>
                    <div class="paper-card-body">
                        <p class="text-eyebrow">{{ t(`articles.categories.${article.category}`) }}</p>
                        <h3 class="paper-card-title resources-grow">{{ article.title }}</h3>
                        <p class="text-small">
                            <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
                            &middot;
                            {{ t('resources.articles.readTime', { minutes: article.readTime }) }}
                        </p>
                        <div class="paper-card-footer">
                            <span class="card-action">
                                {{ t('resources.articles.read') }}<span class="card-action-icon"><ArrowRight :size="17" /></span>
                            </span>
                        </div>
                    </div>
                </RouterLink>
                <RouterLink class="all-tile" :style="{ '--all-tile-span': allTileSpan }" to="/articole">
                    <h3 class="paper-card-title">{{ t('home.resources.allTitle') }}</h3>
                    <p class="all-tile-text">{{ t('home.resources.allText') }}</p>
                    <span class="card-action">
                        {{ t('resources.articles.viewAll') }}<span class="card-action-icon"><ArrowRight :size="17" /></span>
                    </span>
                </RouterLink>
            </div>
        </section>

        <section id="gratuite" class="band resources-free">
            <div class="resources-block">
                <div class="resources-head">
                    <h2 class="section-title">{{ t('resources.freeGuides.title') }}</h2>
                    <p class="text-pretty">{{ t('resources.freeGuides.intro') }}</p>
                </div>
                <div v-reveal:cards class="grid-3">
                    <article v-for="guide in freeGuides" :key="guide.key" class="paper-card paper-card-link">
                        <div class="paper-card-media" role="img"
                            :aria-label="t(`resources.freeGuides.${guide.key}.imageAlt`)"></div>
                        <div class="paper-card-body resources-free-body">
                            <h3 class="paper-card-title resources-grow text-pretty">
                                {{ t(`resources.freeGuides.${guide.key}.title`) }}
                            </h3>
                            <button type="button" class="button-outline resources-download stretch-to-card">
                                <Download :size="16" aria-hidden="true" />
                                {{ t('resources.freeGuides.download') }}
                            </button>
                        </div>
                    </article>
                </div>
            </div>

            <div class="resources-practical">
                <div class="resources-practical-head">
                    <h3>{{ t('resources.practical.title') }}</h3>
                    <p class="text-pretty">{{ t('resources.practical.intro') }}</p>
                </div>
                <div v-reveal:cards class="resources-practical-grid">
                    <article v-for="resource in practicalResources" :key="resource.key"
                        class="paper-card paper-card-link resources-practical-card">
                        <p class="resources-practical-meta">
                            <span class="text-eyebrow resources-practical-kind">
                                <component :is="resource.icon" :size="14" aria-hidden="true" />
                                {{ t(`resources.practical.${resource.key}.label`) }}
                            </span>
                            <span class="resources-dot" aria-hidden="true"></span>
                            {{ t(`resources.practical.${resource.key}.duration`) }}
                        </p>
                        <h4 class="resources-practical-title resources-grow text-pretty">
                            {{ t(`resources.practical.${resource.key}.title`) }}
                        </h4>
                        <button type="button" class="card-action resources-practical-action stretch-to-card">
                            {{ t(`resources.practical.${resource.key}.action`) }}
                            <span class="card-action-icon"><component :is="resource.actionIcon" :size="17" /></span>
                        </button>
                    </article>
                </div>
            </div>
        </section>

        <section id="premium" class="band resources-premium">
            <div class="resources-premium-head">
                <div class="resources-head">
                    <h2 class="section-title">{{ t('resources.premium.title') }}</h2>
                    <p class="text-pretty">{{ t('resources.premium.intro') }}</p>
                </div>
                <button type="button" class="link-arrow">
                    {{ t('resources.premium.viewAll') }}<ArrowRight :size="17" />
                </button>
            </div>
            <div v-reveal:cards class="grid-3">
                <article v-for="guide in premiumGuides" :key="guide.key" class="paper-card"
                    :class="{ 'paper-card-link': priceOf(guide.key) }">
                    <div class="paper-card-media" role="img"
                        :aria-label="t(`resources.premium.${guide.key}.imageAlt`)"></div>
                    <div class="paper-card-body">
                        <h3 class="paper-card-title text-pretty">{{ t(`resources.premium.${guide.key}.title`) }}</h3>
                        <p class="paper-card-text text-pretty">{{ t(`resources.premium.${guide.key}.text`) }}</p>
                        <div class="paper-card-footer">
                            <span class="paper-card-price">
                                {{ priceOf(guide.key) ? formatPrice(priceOf(guide.key)) : '' }}
                            </span>
                            <button type="button" class="button-primary stretch-to-card" :disabled="!priceOf(guide.key)"
                                @click="checkoutKey = guide.key">
                                {{ t('resources.premium.buy') }}
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </section>

        <CtaBand :title="t('resources.cta.title')" :text="t('resources.cta.text')" />

        <ResourceCheckout :resource-key="checkoutKey" :session-id="sessionId" @close="closeCheckout" />
    </main>
</template>

<style scoped lang="scss">
    // No hero photo yet; the text column sets the row height, as it will for the real one.
    .resources-hero-placeholder {
        min-height: 0;
        border-radius: 0;
    }

    .resources-head {
        display: flex;
        flex-direction: column;
        gap: var(--s-12);
    }

    .resources-grow {
        flex: 1;
    }

    .resources-articles .all-tile {
        grid-column: span var(--all-tile-span);
    }

    .resources-free {
        gap: var(--s-48);
    }

    .resources-block {
        display: flex;
        flex-direction: column;
        gap: var(--s-28);
    }

    .resources-free-body {
        gap: var(--s-16);
    }

    .resources-download {
        align-self: flex-start;
        gap: var(--s-8);
    }

    .resources-practical {
        display: flex;
        flex-direction: column;
        gap: var(--grid-gap);
        padding-top: 40px;
        border-top: 1px solid var(--hairline);
    }

    .resources-practical-head {
        display: flex;
        flex-direction: column;
        gap: var(--s-8);

        h3 {
            margin: 0;
        }
    }

    .resources-practical-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--grid-gap);
    }

    .resources-practical-card {
        gap: var(--s-10);
        padding: var(--card-pad);
    }

    .resources-practical-meta {
        display: flex;
        align-items: center;
        gap: var(--s-10);
        font-size: var(--fs-caption);
        line-height: 1.4;
        color: var(--ink-muted);
    }

    .resources-practical-kind {
        display: flex;
        align-items: center;
        gap: var(--s-6);
    }

    .resources-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--disabled);
    }

    .resources-practical-title {
        margin: 0;
        font-size: var(--fs-h4);
        line-height: 1.4;
    }

    .resources-practical-action {
        width: 100%;
        justify-content: space-between;
        padding: var(--s-14) 0 0;
        border-top: 1px solid var(--line-card);
        border-radius: 0;
        background: transparent;

        &:hover {
            background: transparent;
            color: var(--olive-700);
        }
    }

    .resources-premium {
        gap: var(--s-28);
    }

    .resources-premium-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--s-32);

        .resources-head {
            flex: 1;
        }
    }

    .resources-premium-head .link-arrow {
        white-space: nowrap;
    }

    .paper-card-footer .button-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    // Tablet: two per row; the all-tile's span counts a 3-column row, so it becomes a plain cell.
    @media (max-width: 1023px) {
        .resources-articles .all-tile {
            grid-column: auto;
        }

        .resources-practical-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 767px) {
        .resources-hero-placeholder {
            border-radius: var(--r-block) 0 0 var(--r-block);
        }

        .grid-3,
        .resources-practical-grid {
            grid-template-columns: minmax(0, 1fr);
        }

        .resources-premium-head {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
