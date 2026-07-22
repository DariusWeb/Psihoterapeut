<script setup>
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()

    const { title, subtitle, quote, cta, route, image, alt } = defineProps({
        title: String,
        subtitle: String,
        quote: String,
        cta: String,
        route: String,
        image: String,
        alt: String
    })
</script>

<template>
    <section class="hero-section">
        <div class="hero-content">
            <h1 class="hero-title">{{ title }}</h1>
            <p class="hero-subtitle">{{ subtitle }}</p>
            <p class="hero-quote">{{ quote }}</p>
            <RouterLink class="button hero-cta" :to="route">{{ cta }}</RouterLink>
        </div>

        <img class="oval-frame" :src="image" :alt="alt" width="300" height="300" decoding="async" loading="eager"
            fetchpriority="high" />
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

    .hero-title {
        font-size: 2rem;
        text-align: inherit;
        margin-bottom: 1rem;
    }

    @media (max-width: 1024px) {
        .hero-section {
            flex-direction: column;
            text-align: center;
            align-items: center;

            .oval-frame {
                width: 220px;
                height: 220px;
            }
        }

        .hero-content {
            align-items: center;
        }

        .hero-title {
            font-size: 1.6rem;
        }
    }

    @media (max-width: 768px) {
        .hero-section {
            .oval-frame {
                width: 180px;
                height: 180px;
            }
        }

        .hero-title {
            font-size: 1.3rem;
        }
    }
</style>
