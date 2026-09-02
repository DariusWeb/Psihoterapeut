<script setup>
    import { ref, onMounted } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { Heart, Share2 } from '@lucide/vue'
    import ShareModal from '@/components/common/ShareModal.vue'

    const props = defineProps({
        slug: { type: String, required: true },
        title: { type: String, default: '' }
    })

    const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT
    const storageKey = `liked:${props.slug}`

    const { t } = useI18n()
    const count = ref(null)
    const liked = ref(false)
    const sending = ref(false)
    const shareModal = ref(null)
    const shareButton = ref(null)

    // ponytail: a browser flag, not an identity — clearing site data allows another like.
    // Anything stronger would mean storing a visitor identifier, which a like does not justify.
    const readFlag = () => {
        try { return localStorage.getItem(storageKey) === '1' } catch { return false }
    }

    onMounted(async () => {
        liked.value = readFlag()
        if (!ENDPOINT) return

        try {
            const response = await fetch(`${ENDPOINT}/likes?slugs=${encodeURIComponent(props.slug)}`)
            const payload = await response.json()
            if (payload.ok) count.value = payload.counts[props.slug] ?? 0
        } catch {
            // A missing count just hides the number; the share button still works.
        }
    })

    // Nothing is remembered until the write is confirmed: a refused or unreachable route
    // must leave the button live, or one failed click disables it for good.
    async function like() {
        if (liked.value || sending.value || !ENDPOINT) return
        sending.value = true

        try {
            const response = await fetch(`${ENDPOINT}/likes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: props.slug })
            })
            const payload = await response.json()
            if (!payload.ok) return

            count.value = payload.count
            liked.value = true
            try { localStorage.setItem(storageKey, '1') } catch { /* private mode */ }
        } catch {
            // Unreachable — stays clickable so it can be tried again.
        } finally {
            sending.value = false
        }
    }


</script>

<template>
    <div class="share-like">
        <button type="button" class="button button-outline share-like-button" :disabled="liked || sending"
            :aria-label="t('share.like')" @click="like">
            <Heart :size="16" :fill="liked ? 'currentColor' : 'none'" aria-hidden="true" />
            <span v-if="count !== null">{{ count }}</span>
        </button>

        <button ref="shareButton" type="button" class="button button-outline share-like-button"
            @click="shareModal.open(shareButton)">
            <Share2 :size="16" aria-hidden="true" />
            {{ t('share.share') }}
        </button>

        <ShareModal ref="shareModal" :title="title" />
    </div>
</template>

<style scoped lang="scss">
    .share-like {
        display: flex;
        gap: 0.75rem;
        margin-top: var(--card-padding);
    }

    .share-like-button {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
    }
</style>
