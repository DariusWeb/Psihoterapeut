<script setup>
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()

    const { title, subtitle, quote, cta, image } = defineProps({
        title: String,
        subtitle: String,
        quote: String,
        cta: String,
        image: String
    })
</script>

<template>
    <section class="hero-section">
        <div class="hero-content">
            <h2 class="hero-title">{{ title }}</h2>
            <p class="hero-subtitle">{{ subtitle }}</p>
            <p class="hero-quote">{{ quote }}</p>
            <button class="hero-cta">{{ cta }}</button>
        </div>

        <img class="oval-frame" :src="image" alt="Banner Image" />
    </section>
</template>

<style scoped lang="scss">
    .hero-section {
        padding: var(--section-padding);
        background-color: var(--background-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        overflow: hidden;

        .oval-frame {
            width: 300px;
            height: 300px;
            object-fit: cover;
            border-bottom-right-radius: 50%;
            border-top-left-radius: 65%;
            border-bottom-left-radius: 65%;
        }
    }

    .hero-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .hero-title,
    .hero-quote {
        font-style: italic;
    }
</style>
