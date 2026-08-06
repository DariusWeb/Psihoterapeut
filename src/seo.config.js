// Single source of truth for everything that needs an absolute URL. No Vue or asset imports —
// vite.config.js imports this too, so `base` and the origin can never drift apart.
export const SITE = {
	url: 'https://dariusweb.github.io/Psihoterapeut',
	base: '/Psihoterapeut/',
	name: 'Andreea Georgiana Butacu',
	lang: 'ro',
	locale: 'ro_RO',
	// No purpose-made 1200x630 asset exists yet; cropping a portrait to that ratio would cut her face.
	image: null,
	indexable: false
}

export const TITLE_SUFFIX = ' | Andreea Butacu'

// ponytail: hand-maintained. Generate from content/ when articles pass ~10.
export const SITEMAP_PATHS = [
	'/',
	'/despre-mine',
	'/servicii',
	'/infertilitate',
	'/maternitate',
	'/cariera',
	'/articole',
	'/ateliere',
	'/resurse',
	'/noutati',
	'/contact',
	'/confidentialitate',
	'/termeni'
]

export function absoluteUrl(path = '/') {
	return SITE.url + path
}
