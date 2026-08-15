// A one-key announcement banner: the admin page writes it, every visitor polls it.
// Auth is a shared token, not an origin check — the admin page is opened directly, so
// a top-level navigation carries no Origin header at all.

const KEY = 'announcement'
const LIMITS = { title: 80, text: 200, ctaLabel: 40, url: 500 }
const DELAYS = [0, 10, 20, 30]
const DURATIONS = [30, 60, 120, 240, 0] // 0 = no expiry, cleared by hand

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

const pick = (value, allowed) => (allowed.includes(Number(value)) ? Number(value) : allowed[0])

export async function readLive(env) {
    const stored = await env.LIVE.get(KEY, 'json')
    if (!stored) return { live: false }

    // Scheduling is resolved here, on the Worker's clock: visitor clocks drift by minutes
    // and a skewed one would show the banner early or never.
    if (Date.now() < stored.startsAt) return { live: false }

    const { startsAt: _startsAt, ...visible } = stored
    return { live: true, ...visible }
}

// What the dashboard needs that visitors must not get: whether something is pending.
// A scheduled announcement is not public until it starts, so this is gated too.
export async function readLiveAdmin(env) {
    const stored = await env.LIVE.get(KEY, 'json')
    if (!stored) return { status: 200, body: { state: 'none' } }

    const msRemaining = stored.startsAt - Date.now()

    return {
        status: 200,
        body:
            msRemaining > 0
                ? {
                      state: 'scheduled',
                      minutesUntilVisible: Math.ceil(msRemaining / 60_000),
                      announcement: stored
                  }
                : { state: 'live', announcement: stored }
    }
}

// Callers reach here only once authorizeAdmin has verified the signed-in user.
export async function writeLive(request, env) {
    const body = await request.json().catch(() => null)
    if (!body) return { status: 400, body: { ok: false, error: 'bad_json' } }

    if (body.off === true) {
        await env.LIVE.delete(KEY)
        return { status: 200, body: { ok: true, cleared: true } }
    }

    const title = clean(body.title, LIMITS.title)
    if (!title) return { status: 400, body: { ok: false, error: 'title_required' } }

    const url = clean(body.url, LIMITS.url)
    // This string lands in an href on every visitor's page; anything but https is an injection.
    if (url && !url.startsWith('https://')) {
        return { status: 400, body: { ok: false, error: 'url_must_be_https' } }
    }

    const delayMinutes = pick(body.delayMinutes, DELAYS)
    const durationMinutes = pick(body.durationMinutes, DURATIONS)

    const announcement = {
        id: Date.now(),
        platform: clean(body.platform, 20) || 'other',
        title,
        text: clean(body.text, LIMITS.text),
        ctaLabel: clean(body.ctaLabel, LIMITS.ctaLabel),
        url,
        startsAt: Date.now() + delayMinutes * 60_000
    }

    // The key deletes itself, so "disappears and never comes back until called again"
    // needs no logic anywhere else. The delay is included or a scheduled banner would
    // expire before it ever became visible.
    const options =
        durationMinutes > 0 ? { expirationTtl: (delayMinutes + durationMinutes) * 60 } : {}

    await env.LIVE.put(KEY, JSON.stringify(announcement), options)

    return { status: 200, body: { ok: true, id: announcement.id, startsAt: announcement.startsAt } }
}
