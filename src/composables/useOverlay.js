import { nextTick, onUnmounted, ref } from 'vue'

// The search overlay opens from inside the nav overlay, so the page can be locked by more than
// one at a time. A count, not a flag: the last one out restores the page.
let openCount = 0

// `inert` hands keyboard trapping to the platform instead of a hand-rolled Tab cycle
function applyPageLock() {
    const locked = openCount > 0
    const root = document.documentElement
    root.style.scrollbarGutter = locked ? 'stable' : ''
    root.style.overflow = locked ? 'hidden' : ''
    document.body.style.overflow = locked ? 'hidden' : ''

    document.querySelectorAll('header, #main, footer').forEach((el) => {
        el.toggleAttribute('inert', locked)
    })
}

export function useOverlay({ onEscape } = {}) {
    const isOpen = ref(false)
    let held = false

    function hold() {
        if (held) return
        held = true
        openCount += 1
        applyPageLock()
    }

    function release() {
        if (!held) return
        held = false
        openCount -= 1
        applyPageLock()
    }

    // The overlay teleports to body, so it is only in the DOM to receive focus after a tick.
    async function open(focusTarget) {
        isOpen.value = true
        hold()
        await nextTick()
        focusTarget?.value?.focus()
    }

    function close(restoreTarget) {
        if (!isOpen.value) return
        isOpen.value = false
        release()
        restoreTarget?.value?.focus()
    }

    function handleKeydown(event) {
        if (event.key === 'Escape' && isOpen.value) onEscape()
    }

    if (onEscape) window.addEventListener('keydown', handleKeydown)

    onUnmounted(() => {
        release()
        if (onEscape) window.removeEventListener('keydown', handleKeydown)
    })

    return { isOpen, open, close, hold, release }
}
