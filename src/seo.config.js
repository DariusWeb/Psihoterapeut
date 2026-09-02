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

// Built but not launched yet. Emptying this list brings a page back everywhere at once:
// router, navigation, sitemap and site search all filter on it.
export const HIDDEN_PATHS = ['/ateliere', '/grupuri', '/noutati']

// Matches the page and everything under it — detail routes and in-page anchors included.
export function isHiddenPath(path = '') {
	return HIDDEN_PATHS.some(
		(hidden) => path === hidden || path.startsWith(`${hidden}/`) || path.startsWith(`${hidden}#`)
	)
}

// ponytail: hand-maintained. Generate from content/ when articles pass ~10.
export const SITEMAP_PATHS = [
	'/',
	'/despre-mine',
	'/servicii',
	'/servicii/infertilitate',
	'/servicii/maternitate',
	'/servicii/cariera',
	'/articole',
	'/ateliere',
	'/resurse',
	'/noutati',
	'/programare',
	'/contact',
	'/confidentialitate',
	'/termeni'
]

export const VISIBLE_SITEMAP_PATHS = SITEMAP_PATHS.filter((path) => !isHiddenPath(path))

export function absoluteUrl(path = '/') {
	return SITE.url + path
}
