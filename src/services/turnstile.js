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

// Each token is single-use, so this renders per submit and resets the widget after.
const widgets = new WeakMap()

export async function getToken(element) {
    if (!SITEKEY) throw new Error('Turnstile is not configured: VITE_TURNSTILE_SITEKEY must be set.')

    // No turnstile.ready(): it throws when api.js loads async, and onload already guarantees window.turnstile.
    await loadScript()

    let widget = widgets.get(element)

    if (!widget) {
        // render() binds callbacks once, so they hand off to whichever submit is waiting now.
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
        widget.token = null
        window.turnstile.reset(widget.id)
    }

    return new Promise((resolve, reject) => {
        if (widget.token) return resolve(widget.token)
        widget.pending = { resolve, reject }
    })
}
