import { SITE, TITLE_SUFFIX, absoluteUrl } from '@/seo.config'

function upsert(tag, selector, attrs) {
	let el = document.head.querySelector(selector)
	if (!el) {
		el = document.head.appendChild(document.createElement(tag))
	}
	for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
	return el
}

function upsertMeta(key, content, attr = 'name') {
	if (!content) {
		document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
		return
	}
	upsert('meta', `meta[${attr}="${key}"]`, { [attr]: key, content })
}

// Vite-resolved asset URLs already carry the base path, so resolve against the origin, not SITE.url.
function absoluteAsset(url) {
	return url && new URL(url, SITE.url).href
}

export function applySeo({ title, description, path, image, type = 'website' }) {
	const fullTitle = title ? title + TITLE_SUFFIX : SITE.name
	const url = absoluteUrl(path)
	const shareImage = absoluteAsset(image ?? SITE.image)

	document.title = fullTitle
	upsert('link', 'link[rel="canonical"]', { rel: 'canonical', href: url })
	upsertMeta('description', description)
	upsertMeta('robots', SITE.indexable ? null : 'noindex, nofollow')

	upsertMeta('og:title', fullTitle, 'property')
	upsertMeta('og:description', description, 'property')
	upsertMeta('og:url', url, 'property')
	upsertMeta('og:type', type, 'property')
	upsertMeta('og:locale', SITE.locale, 'property')
	upsertMeta('og:site_name', SITE.name, 'property')
	upsertMeta('og:image', shareImage && absoluteUrl(shareImage), 'property')

	upsertMeta('twitter:card', shareImage ? 'summary_large_image' : 'summary')
	upsertMeta('twitter:title', fullTitle)
	upsertMeta('twitter:description', description)
	upsertMeta('twitter:image', shareImage && absoluteUrl(shareImage))
}

// `id` scopes the block so pages can own one graph each without clobbering the static one in index.html.
export function applyJsonLd(id, data) {
	const selector = `script[data-seo="${id}"]`
	if (!data) {
		document.head.querySelector(selector)?.remove()
		return
	}
	upsert('script', selector, { type: 'application/ld+json', 'data-seo': id }).textContent =
		JSON.stringify(data)
}
