const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise = null

function loadScript() {
    if (scriptPromise) return scriptPromise

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Turnstile failed to load'))
        document.head.appendChild(script)
    })

    return scriptPromise
}

export const turnstileEnabled = Boolean(SITEKEY)

// Renders into `element` and resolves with a token. Each token is single-use, so this runs
// per submit and resets the widget afterwards.
export async function getToken(element) {
    if (!SITEKEY) throw new Error('Turnstile is not configured: VITE_TURNSTILE_SITEKEY must be set.')

    // No turnstile.ready() here: it throws when api.js is loaded async, and the script's
    // own onload already guarantees window.turnstile exists.
    await loadScript()

    return new Promise((resolve, reject) => {
        window.turnstile.render(element, {
            sitekey: SITEKEY,
            callback: resolve,
            'error-callback': () => reject(new Error('Turnstile challenge failed')),
            'expired-callback': () => reject(new Error('Turnstile token expired'))
        })
    })
}

export function reset(element) {
    window.turnstile?.reset(element)
}
