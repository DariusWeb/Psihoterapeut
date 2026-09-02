# Client Requests — "Modif site"

Companion to [PROJECT-STATUS.md](./PROJECT-STATUS.md). That one tracks launch readiness;
this one tracks the client's own change requests from `Site psihoterapie.xlsx`.

**Rows are keyed by her spreadsheet cell reference** (`H3`, `G5`, `I6`…). That is the shared
vocabulary between her, you, and any future session — quote the cell ref back to her when
asking a question, and she can find it in her own file.

Source tabs: `Modif site` (34 populated cells) and `Bug-uri` (3 items).

**Last updated:** 2026-09-01

Status values: `done` · `todo` · `blocked-on-client` · `parked`

---

## Batch 1 — copy + email (no logic)

| Cell | Request | Where | Status |
|---|---|---|---|
| H3 | Hero banner: online / față în față, București | `contact.note.sessions` + `.place` — widget already existed with the right icons | done |
| H6 | Contact form success + error copy | `contact.form.success` / `.error` | done |
| G6 | Replace personalised-support CTA | `events.cta.title` + `.text` | done |
| I4 | Newsletter subscribe description | `newsletter.*` — whole block was still English | done |
| I5 | Post-subscribe confirmation message | `newsletter.success` | done |
| I8 | Terms page email | `terms.contact.body` | done |
| I3 | Privacy §1 real controller identity | `privacy.controller.*` | done |
| — | Email cleanup (display addresses only) | Footer, privacy, terms, contact reach, ro.json | done |

**I3 closes a live blocker** — `PROJECT-STATUS.md` listed `[full name / PFA]`,
`[registered address]` and `[registration number]` as unfilled. She supplied all three:
Andreea Butacu, București, Colegiul Psihologilor nr. 1708 / 27.03.2025.

**Worker email deliberately untouched.** `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` in
`worker/wrangler.toml` stay `maury_4u@yahoo.com` by explicit decision — they get swapped
for a domain sender when the custom domain lands. Still on the pre-launch list.

---

## Batch 2 — small fixes

| Cell | Request | Status |
|---|---|---|
| H5 | Floating labels escape the input box | done |
| H7 | Strip item 1 → "În ritmul tău" (+ icon swapped to `Sprout`) | done |
| I6 | Session price 250 RON, display-only + configurable | done |
| Bug 1 | "about me" button inconsistent with events/resources | done |
| Bug 2 | Ateliere: max 3 per row on desktop, not 4 | done |

H5 note: the fix also adds the missing `:focus` branch. Today an empty focused field keeps
its label sitting on top of the text being typed — she has not reported it yet, but will.

---

## Batch 3 — hide /ateliere

| Cell | Request | Status |
|---|---|---|
| G3 | Hide the Ateliere page in the first phase | done |

Decision: one `HIDDEN_PATHS` list in `src/seo.config.js` drives the router, the nav, the
sitemap and site search, so re-enabling is one edit instead of four. The groups list stays on
`/ateliere` and comes back with it.

**Currently hidden (2026-09-02):** `/ateliere`, `/grupuri`, `/noutati`. Prefix-matched, so
detail routes (`/ateliere/:slug`, `/grupuri/:slug`) and anchors hide with their parent.

> **News needed a second mechanism.** Its search entries link straight out to the press
> (`digi24.ro`, `protv.ro`…), so the path filter cannot see them — 29 external results would
> have stayed searchable after the page was hidden. `buildSearchIndex` now skips
> `newsEntries()` entirely when `/noutati` is hidden.

---

## Batch 4 — group detail pages

| Cell | Request | Status |
|---|---|---|
| G5 | "Detalii și înscriere" button for support groups, like the workshops have | done |

Each group gets a real detail page at `/grupuri/:slug`, mirroring `/ateliere/:slug` —
place, format, how the group runs. Signup reuses the existing contact endpoint with a
group field rather than a new Worker handler.

> **Body copy is hers to write.** The plumbing and the three content files get built; the
> bodies stay TODO until she supplies them. The four existing event bodies are still
> placeholder lorem, so this gap predates the request.

---

## Batch 5 — like + share

| Cell | Request | Status |
|---|---|---|
| F4 | Like / share on articles | done |
| G4 | Like / share on events | done |

Decision: share via Web Share API with a copy-link fallback (no storage); likes counted in
Cloudflare KV behind a Worker route, per-visitor dedupe via `localStorage`.

> **Forces a privacy-policy edit.** Storing a like means §5 needs a line. The policy already
> contradicts itself (claims "this site runs no analytics" while PostHog ships) — fold both
> into one fix rather than adding a fifth contradiction.

---

## Batch 6 — free guide downloads

| Cell | Request | Status |
|---|---|---|
| F3 | Download flow for free guides + practical resources | blocked-on-client |

All seven download buttons are inert today — no `@click`, no `href`, no handler. The
content file says so in writing.

**Blocked on two things:** the PDF files do not exist, and it forks on a product question —
open download, or email-gated feeding the newsletter list? The premium flow
(`ResourceCheckout.vue` + Stripe + signed links + Brevo delivery) is already built and is
the natural thing to strip down for a free tier.

---

## Parked — questions for the client

She phrased these as questions in the sheet, not instructions. Nothing is being built.

| Cell | Her question | Ask her this | Status |
|---|---|---|---|
| A9 / B9 | "dacă se poate?" / "neclaritate" | Orphan fragments with no referent — what do they attach to? | parked |
| A13 / A14 | "Cost — sub formă de articol? Tarife & Cum lucrăm împreună" / "sau pe pagina cu servicii?" | A dedicated `/tarife` page beats an article — pricing is a navigational answer, not a read-once piece. Either way she writes the copy. | parked |
| A16 | "de șters de pe pagina cu servicii toate credențialele??" | Credentials render in **two** places: the per-service hero and the Home page block. Which one? | parked |
| A18 | "de add faptul că imaginile sunt generate cu AI?" | Cheap — one line in footer or terms. Her call whether it's visible. | parked |
| A20 | "About me cu povestea infertilității / maternității?" | Entirely her copy. Nothing to build until it exists. | parked |
| Bug 3 | Icon max 50% larger than a line, top-aligned, text starting from the icon's left | Cross-cutting across ~8 components, and the described layout matches nothing currently in the site. Needs a sketch or a reference. | parked |

---

## Answers to give her — no code needed

| Cell | Her question | Answer |
|---|---|---|
| I7 | "?? fusul tău orar?? este dinamic??" | **Yes, already.** Slots are ISO instants rendered with `Intl.DateTimeFormat`, so they land in each visitor's own zone. `booking.widget.timezoneNote` already says so — worth wording more plainly if she missed it. |
| H5 | "Asta era intenția?" | **No, it's a bug.** Being fixed in Batch 2. |
| H3 | Hero banner request | **Already existed**, with the exact laptop + plant icons she described. Only the wording changed. |

---

## Left to do before any of this reaches her

**1. Create the LIKES KV namespace and redeploy the Worker.** Until then `/likes` answers 503
and the buttons render with no count (the share half works regardless):

```
npx wrangler kv namespace create LIKES --config worker/wrangler.toml
```

Then uncomment the `LIKES` block in `worker/wrangler.toml`, paste the id, and
`npm run worker:deploy`.

**2. Browser-verify the two visual changes.** Neither can be called done from the code:
- **H5 floating labels** — check every form (Contact, Booking, group signup) empty, focused
  and filled. The label now floats inside the field's top edge instead of escaping it.
- **Bug 2** — the workshop grid at ≥1400px, after pressing "vezi toate", should cap at 3.

**3. Group detail bodies.** `src/content/groups/*.vue` carry a TODO placeholder. They need
her copy: format, flow, what happens at a meeting, who it is for.

## Verified this pass

- `npm run lint` clean · `npm run build` clean
- `npm run worker:test` — 78 checks, including 6 new ones for the likes route
- The hide flag round-trips: emptying `HIDDEN_PATHS` puts `/ateliere` back in `dist/sitemap.xml`,
  the nav, the router and site search; restoring it removes them again

## A bug the tests caught

The first cut of `addLike` ran the slug through `cleanString(slug, 80)` before validating it.
An 81-character slug was silently truncated to a *valid* 80-character one, which would merge
two different pages onto one counter. It now validates the untrimmed value and lets the
regex enforce the length.

---

## Share UI rebuild (2026-09-02)

The first cut of `ShareLike.vue` was written without reading `DESIGN-SYSTEM.md` and invented
its own visual language. Rebuilt against the site's own patterns.

**Three reported problems, all one root cause — hand-rolled instead of composed:**

| Problem | Cause | Fix |
|---|---|---|
| Buttons vanished on hover | `background: transparent` opted out of the green fill but not the `color: var(--vt-c-white)` half of the global `button:hover`, giving white-on-white in **light mode only** | Compose `.button-outline` |
| "Windows-ish" | Invented `box-shadow` ring hover + five hardcoded literals | Site button classes + tokens |
| Wrong interaction | `navigator.share` with a silent copy fallback | A real modal |

**Modal:** `ShareModal.vue`, built on `useOverlay` like `SiteSearch`. Centred, H3 title, mark
inline with the title and the subtitle starting under the mark, copy row, labelled divider,
then outline-free icon-above-label tiles. WhatsApp / Facebook / LinkedIn / Email.

**Instagram dropped** — Meta publishes no web share URL. **Native share removed** on request.

**Brand icons** are the one documented exception to "lucide only" (lucide ships no brand
marks) — they live in `BrandIcon.vue` and nowhere else. Carve-out written into §1.

**Overlay CSS extracted** to `.overlay` / `.overlay-panel` in `base.scss`; `SiteSearch` and
`ResourceCheckout` refactored onto it. Panel width is `--overlay-panel-width` (40rem search,
30rem default). The mobile block sits *after* `.card` so a panel composing `.card` still goes
flush — same specificity, so order decides.

**Two bugs found and fixed during verification:**
- `useOverlay` locked `body` overflow, but the scrollbar belongs to `html` — every modal on
  the site left the bar visible. Now locks both, with `scrollbar-gutter: stable` so the page
  doesn't jump.
- The copy button went blank mid-swap under `mode="out-in"`, and shrank 153→109px. Now a
  grid cross-fade with a hidden sizer holding the resting width.

**Transitions normalised.** Every interaction that changes colour/border/position now uses
`--vt-c-transition-speed`. Removed six invented durations (`0.12s`/`0.15s`/`0.18s`/`0.2s`/`0.25s`)
across `ShareModal`, `SiteSearch`, `ResourceCheckout`, `Navigation`, `NewsFilter`, `NewsItem`
and `base.scss`. `body`'s `0.5s` theme cross-fade is the one deliberate exception. Rule
documented in `DESIGN-SYSTEM.md`.

**Verified in Chrome** (light + dark, desktop + 390px): hover contrast 5.73:1, modal
open/Escape/backdrop-click/focus-return, scrollbar hidden then restored, "Copiat" holds ~3s
and resets, mobile full-bleed, and both refactored overlays regression-tested.
