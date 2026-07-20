<script setup>
    import { useI18n } from 'vue-i18n'
    import { TOPICS } from '@/stores/newsStore'

    const { t } = useI18n()

    const props = defineProps({
        modelValue: { type: String, default: 'all' },
    })

    const emit = defineEmits(['update:modelValue'])

    function select(topic) {
        emit('update:modelValue', topic)
    }
</script>

<template>
    <div class="news-filter" role="group" :aria-label="t('news.filter.label')">
        <button class="filter-pill" :class="{ active: modelValue === 'all' }" @click="select('all')">
            {{ t('news.filter.all') }}
        </button>

        <button v-for="topic in TOPICS" :key="topic" class="filter-pill" :class="{ active: modelValue === topic }"
            @click="select(topic)">
            {{ t(`news.topics.${topic}`) }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
    .news-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 2.5rem;
    }

    .filter-pill {
        padding: 0.4rem 1.1rem;
        border-radius: 2rem;
        border: 2px solid var(--vt-c-jannafer-gray2);
        background: transparent;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        color: var(--vt-c-black);
        transition: all 0.18s ease;

        &:hover {
            border-color: var(--vt-c-jannafer-green);
            color: var(--vt-c-jannafer-green);
        }

        &.active {
            background: var(--vt-c-jannafer-green);
            border-color: var(--vt-c-jannafer-green);
            color: var(--vt-c-white);
        }
    }
</style>
