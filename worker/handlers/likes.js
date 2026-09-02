// Like counts for articles and events. No identity is stored — only a number per slug.
// ponytail: KV has no atomic increment, so two likes landing together can collapse into one.
// Move to a Durable Object if the count ever has to be exact.

const SLUG = /^[a-z0-9-]{1,80}$/
const MAX_SLUGS = 30

const key = (slug) => `likes:${slug}`

export const likesConfigured = (env) => Boolean(env.LIKES)

export async function readLikes(request, env) {
    const slugs = (new URL(request.url).searchParams.get('slugs') ?? '')
        .split(',')
        .map((slug) => slug.trim())
        .filter((slug) => SLUG.test(slug))
        .slice(0, MAX_SLUGS)

    const counts = {}
    await Promise.all(
        slugs.map(async (slug) => {
            counts[slug] = Number(await env.LIKES.get(key(slug))) || 0
        })
    )

    return { ok: true, counts }
}

export async function addLike(data, env) {
    // Validated untruncated: trimming to the cap first would turn an over-long slug into a
    // valid one, silently merging two pages onto the same counter.
    const slug = typeof data.slug === 'string' ? data.slug.trim() : ''
    if (!SLUG.test(slug)) return { ok: false, error: 'invalid_fields' }

    const count = (Number(await env.LIKES.get(key(slug))) || 0) + 1
    await env.LIKES.put(key(slug), String(count))

    return { ok: true, count }
}
