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
const widgets = new WeakMap()

export async function getToken(element) {
    if (!SITEKEY) throw new Error('Turnstile is not configured: VITE_TURNSTILE_SITEKEY must be set.')

    // No turnstile.ready() here: it throws when api.js is loaded async, and the script's
    // own onload already guarantees window.turnstile exists.
    await loadScript()

    let widget = widgets.get(element)

    if (!widget) {
        // render() binds its callbacks once for the widget's lifetime, so they delegate to
        // whichever submit is currently waiting rather than capturing the first one forever.
        widget = {}
        widget.id = window.turnstile.render(element, {
            sitekey: SITEKEY,
            callback: (token) => {
                widget.token = token
                widget.pending?.resolve(token)
            },
            'error-callback': () => widget.pending?.reject(new Error('Turnstile challenge failed')),
            'expired-callback': () => {
                widget.token = null
            }
        })
        widgets.set(element, widget)
    } else {
        // Tokens are single-use, so a repeat submit needs a fresh one from the same widget.
        widget.token = null
        window.turnstile.reset(widget.id)
    }

    return new Promise((resolve, reject) => {
        if (widget.token) return resolve(widget.token)
        widget.pending = { resolve, reject }
    })
}
