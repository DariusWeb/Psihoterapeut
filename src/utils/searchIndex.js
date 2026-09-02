import {
	BookOpen, CalendarDays, File, FileText, HeartHandshake, Newspaper, Scale, Users
} from '@lucide/vue'

import { articles } from '@/content/articles'
import { events } from '@/content/events'
import { news } from '@/content/news'
import { services } from '@/content/services'
import { groups } from '@/content/groups'
import { freeGuides, practicalResources, premiumGuides } from '@/content/resources'
import en from '@/locales/en.json'
import { isHiddenPath } from '@/seo.config'

// Add a content type by adding a key here; nothing else in the app knows the type names.
// `hint` receives the entry plus `t` (vue-i18n) and `d` (locale-aware date formatter) from the caller.
export const SEARCH_TYPES = {
	service: { icon: HeartHandshake, order: 0, labelKey: 'search.types.service' },
	article: {
		icon: FileText,
		order: 1,
		labelKey: 'search.types.article',
		hint: (e, { t, d }) =>
			`${t('resources.articles.readTime', { minutes: e.readTime })} · ${d(e.createdAt)}`
	},
	event: {
		icon: CalendarDays,
		order: 2,
		labelKey: 'search.types.event',
		hint: (e, { t, d }) =>
			e.past
				? t('search.hints.eventPast', { date: d(e.date) })
				: `${d(e.date)}, ${e.time} · ${e.location}`
	},
	page: { icon: File, order: 3, labelKey: 'search.types.page' },
	group: {
		icon: Users,
		order: 4,
		labelKey: 'search.types.group',
		hint: (e, { t }) =>
			`${t(`events.groups.${e.key}.frequency`)} · ${t(`events.groups.${e.key}.location`)}`
	},
	resource: {
		icon: BookOpen,
		order: 5,
		labelKey: 'search.types.resource',
		hint: (e, { t }) => (e.durationKey ? t(e.durationKey) : t('search.hints.freeDownload'))
	},
	legal: {
		icon: Scale,
		order: 6,
		labelKey: 'search.types.legal',
		hint: (e, { t }) => t(`${e.block}.updated`)
	},
	news: {
		icon: Newspaper,
		order: 7,
		labelKey: 'search.types.news',
		external: true,
		hint: (e, { d }) => `${e.source} · ${d(e.date)}`
	}
}

// ponytail: indexes en.json only — ro.json is a 10% overlay and en.json already holds the
// Romanian content copy. Merge the active locale over `en` once ro.json is filled in.
function leaves(node) {
	if (typeof node === 'string') return [node]
	if (!node || typeof node !== 'object') return []
	return Object.values(node).flatMap(leaves)
}

const block = (path) => leaves(path.split('.').reduce((node, key) => node?.[key], en))
const line = (path) => path.split('.').reduce((node, key) => node?.[key], en)

// Each static page's own en.json block, so a hit on body copy resolves to the right route.
const PAGE_BLOCKS = {
	home: ['home'],
	about: ['about'],
	// only the shared copy — the three service subtrees are indexed as their own entries
	services: ['services.index', 'services.credentials'],
	articles: ['articles'],
	events: ['events'],
	resources: ['resources'],
	news: ['news'],
	contact: ['contact'],
	privacy: ['privacy'],
	terms: ['terms']
}

const LEGAL_PAGES = new Set(['privacy', 'terms'])

// NFD splits every Romanian diacritic — including both the comma-below (U+0326) and
// cedilla (U+0327) forms of ș/ț — into base + a mark in this one range.
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function entry(type, title, to, text, extra = {}) {
	const parts = text.filter(Boolean)

	return {
		type,
		title,
		to,
		...extra,
		foldedTitle: fold(title ?? ''),
		// `foldedText` scores the whole corpus; `fragments` only ever runs for the survivors
		foldedText: fold(parts.join(' ')),
		fragments: parts.map((raw) => ({ raw, folded: fold(raw) }))
	}
}

function serviceEntries() {
	return services.map((service) =>
		entry('service', line(`seo.${service.key}.title`), `/servicii/${service.slug}`, [
			...block(`services.${service.key}`),
			line(`seo.${service.key}.description`)
		])
	)
}

function articleEntries() {
	return articles.map((article) =>
		entry(
			'article',
			article.title,
			`/articole/${article.slug}`,
			[article.subtitle, line(`articles.categories.${article.category}`)],
			{ readTime: article.readTime, createdAt: article.createdAt }
		)
	)
}

// Indexes past events too — the list page hides them but `getEventBySlug` still resolves the route.
function eventEntries() {
	const today = new Date().toISOString().split('T')[0]

	return events.map((event) =>
		entry('event', event.title, `/ateliere/${event.slug}`, [event.details, event.location], {
			date: event.date,
			time: event.time,
			location: event.location,
			past: event.date < today
		})
	)
}

function newsEntries() {
	return news.map((item) =>
		entry('news', item.title, item.url, [item.description, item.source, item.topic], {
			source: item.source,
			date: item.date
		})
	)
}

function groupEntries() {
	return groups.map((group) =>
		entry(
			'group',
			line(`events.groups.${group.key}.title`),
			`/grupuri/${group.slug}`,
			block(`events.groups.${group.key}`),
			{ key: group.key }
		)
	)
}

// ponytail: every resource lands on /resurse — content/resources has no per-card destination yet.
function resourceEntries() {
	const collections = [
		['freeGuides', freeGuides],
		['practical', practicalResources],
		['premium', premiumGuides]
	]

	return collections.flatMap(([collection, items]) =>
		items.map((item) => {
			const path = `resources.${collection}.${item.key}`
			const duration = line(`${path}.duration`)

			return entry('resource', line(`${path}.title`), '/resurse', block(path), {
				durationKey: duration ? `${path}.duration` : null
			})
		})
	)
}

function pageEntries(routes) {
	return routes
		.filter((route) => route.meta?.seo && !route.path.includes(':') && PAGE_BLOCKS[route.meta.seo])
		.map((route) => {
			const key = route.meta.seo

			return entry(
				LEGAL_PAGES.has(key) ? 'legal' : 'page',
				line(`seo.${key}.title`),
				route.path,
				[line(`seo.${key}.description`), ...PAGE_BLOCKS[key].flatMap(block)],
				{ block: key }
			)
		})
}

let index = []

// Called once from the router-aware caller so page entries can walk the real route table.
export function buildSearchIndex(routes) {
	index = [
		...serviceEntries(),
		...articleEntries(),
		...eventEntries(),
		...newsEntries(),
		...groupEntries(),
		...resourceEntries(),
		...pageEntries(routes)
	].filter((item) => !isHiddenPath(item.to))

	if (import.meta.env.DEV) runSelfCheck()

	return index
}

// A body match needs to show which sentence matched; a title match is self-evident.
function snippetFor(item, q) {
	const hit = item.fragments.find((fragment) => fragment.folded.includes(q))
	// folding is length-preserving for Romanian, but not every locale — mis-slicing beats no highlight
	if (!hit || hit.folded.length !== hit.raw.length) return null

	const at = hit.folded.indexOf(q)
	const from = Math.max(0, at - 40)
	const to = at + q.length + 60

	return {
		before: (from > 0 ? '…' : '') + hit.raw.slice(from, at),
		match: hit.raw.slice(at, at + q.length),
		after: hit.raw.slice(at + q.length, to) + (to < hit.raw.length ? '…' : '')
	}
}

// Splits the title around the match so the template can wrap the middle in <mark>.
function titleParts(item, q) {
	const at = item.foldedTitle.indexOf(q)
	if (at < 0 || item.foldedTitle.length !== item.title.length) return null

	return {
		before: item.title.slice(0, at),
		match: item.title.slice(at, at + q.length),
		after: item.title.slice(at + q.length)
	}
}

// Returns rows the template can render as-is, so nothing else has to import SEARCH_TYPES.
export function search(query, { t, d }) {
	const q = fold(query.trim())
	if (q.length < 2) return []

	const scored = []

	for (const item of index) {
		const score = item.foldedTitle.startsWith(q)
			? 3
			: item.foldedTitle.includes(q)
				? 2
				: item.foldedText.includes(q)
					? 1
					: 0

		if (score) scored.push({ item, score })
	}

	scored.sort(
		(a, b) =>
			b.score - a.score ||
			SEARCH_TYPES[a.item.type].order - SEARCH_TYPES[b.item.type].order ||
			(a.item.foldedTitle < b.item.foldedTitle ? -1 : a.item.foldedTitle > b.item.foldedTitle ? 1 : 0)
	)

	return scored.slice(0, 20).map(({ item, score }) => {
		const type = SEARCH_TYPES[item.type]

		return {
			type: item.type,
			title: item.title,
			titleParts: score > 1 ? titleParts(item, q) : null,
			to: item.to,
			icon: type.icon,
			label: t(type.labelKey),
			external: type.external ?? false,
			hint: type.hint ? type.hint(item, { t, d }) : '',
			snippet: score === 1 ? snippetFor(item, q) : null
		}
	})
}

function runSelfCheck() {
	const stub = { t: (key) => key, d: (value) => String(value) }
	const run = (q) => search(q, stub)
	const hits = (q, to) => run(q).some((row) => row.to.includes(to))

	console.assert(fold('București') === 'bucuresti', 'search: diacritic fold broken')
	console.assert(fold('anxietăți') === 'anxietati', 'search: diacritic fold broken')
	console.assert(run('a').length === 0, 'search: single char should not match')
	console.assert(index.every((item) => item.title), 'search: an entry has no title')
	console.assert(hits('infertilitate', '/servicii/infertilitate'), 'search: service title match broken')
	console.assert(hits('bucuresti', '/'), 'search: diacritic-insensitive body match broken')
	console.assert(run('termeni')[0]?.type === 'legal', 'search: title should outrank body match')

	const psiho = run('psiho').find((row) => row.to === '/despre-mine')
	console.assert(psiho?.snippet?.match === 'psiho', 'search: body match should carry a snippet')
	console.assert(
		run('termeni')[0]?.snippet === null,
		'search: title match should not carry a snippet'
	)

	const titled = run('termeni')[0]?.titleParts
	console.assert(titled?.match.toLowerCase() === 'termeni', 'search: title match should be highlighted')
	console.assert(
		titled && titled.before + titled.match + titled.after === run('termeni')[0].title,
		'search: title parts should rejoin into the title'
	)
	console.assert(psiho?.titleParts === null, 'search: body-only match should not highlight the title')
}
