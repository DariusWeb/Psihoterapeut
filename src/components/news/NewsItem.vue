<script setup>
    import { useI18n } from 'vue-i18n'

    const { t, locale } = useI18n()

    defineProps({
        id: { type: [Number, String], required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        source: { type: String, default: '' },
        url: { type: String, required: true },
        date: { type: String, required: true },
        topic: { type: String, required: true },
        image: { type: String, default: null },
    })

    // `month: 'short'` on purpose — the news list is dense and the date sits in a meta row.
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString(locale.value, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }
</script>

<template>
    <article class="news-item">
        <div v-if="image" class="news-image">
            <img :src="image" :alt="title" width="600" height="400" decoding="async" loading="lazy" />
        </div>

        <div class="news-body">
            <div class="news-meta">
                <span class="news-topic">{{ t(`news.topics.${topic}`) }}</span>
                <span class="news-date">{{ formatDate(date) }}</span>
            </div>

            <h2 class="news-title">{{ title }}</h2>

            <p v-if="description" class="news-description">{{ description }}</p>

            <div class="news-footer">
                <span v-if="source" class="news-source">{{ source }}</span>
                <a :href="url" target="_blank" rel="noopener noreferrer" class="news-link">
                    {{ t('news.readOriginal') }}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            </div>
        </div>
    </article>
</template>

<style lang="scss" scoped>
    .news-item {
        background: var(--vt-c-white);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: var(--vt-c-shadow);
        display: flex;
        flex-direction: column;
        transition: box-shadow var(--vt-c-transition-speed) ease, transform var(--vt-c-transition-speed) ease;

        &:hover {
            box-shadow: var(--vt-c-shadow-raised);
            transform: translateY(-2px);
        }
    }

    .news-image {
        height: 180px;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .news-body {
        padding: 1.25rem 1.5rem 1.5rem;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .news-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .news-topic {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--vt-c-jannafer-green);
        background: color-mix(in srgb, var(--vt-c-jannafer-green) 12%, transparent);
        padding: 0.2rem 0.65rem;
        border-radius: 2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 60%;
    }

    .news-date {
        font-size: 0.78rem;
        color: rgb(from var(--vt-c-black) r g b / 65%);
        white-space: nowrap;
    }

    .news-title {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.4;
        margin: 0 0 0.6rem;
        color: var(--vt-c-black);
    }

    .news-description {
        font-size: 0.88rem;
        line-height: 1.6;
        color: var(--vt-c-black);
        margin: 0 0 1rem;
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .news-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-top: auto;
        padding-top: 0.75rem;
        border-top: 1px solid var(--vt-c-jannafer-gray2);
    }

    .news-source {
        font-size: 0.78rem;
        color: rgb(from var(--vt-c-black) r g b / 65%);
        font-style: italic;
    }

    .news-link {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--vt-c-jannafer-green);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
</style>
