<script setup>
    import { useI18n } from 'vue-i18n'

    const { t, tm } = useI18n()
</script>

<template>
    <section class="testimonials layout-full">
        <div class="layout-container">
            <h3>{{ t('events.testimonials.title') }}</h3>

            <div class="testimonials-grid">
                <div v-for="(testimonial, index) in tm('events.testimonials.items')" :key="index"
                    class="testimonial-card">
                    <p>{{ testimonial.text }}</p>
                    <span class="author">{{ testimonial.author }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
    .testimonials {
        background: var(--vt-c-jannafer-gray);
        padding: var(--vt-c-section-padding);
        text-align: center;
        margin-top: 4rem;

        &-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .testimonial-card {
            padding: 2rem;
            border-radius: 8px;
            font-style: italic;

            .author {
                display: block;
                margin-top: 1rem;
                font-style: normal;
                font-weight: 500;
            }
        }
    }
</style>