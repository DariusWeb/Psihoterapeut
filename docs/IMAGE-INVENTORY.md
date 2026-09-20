# Image Inventory — what still needs a picture

Every `.media-placeholder` in the app, swept 2026-09-20. A placeholder is the lucide
`Image` icon on a tinted box: the slot is built, styled and has its `alt` written — only
the file is missing.

Widths are **measured** at a 1440 viewport unless noted. To produce a file, take the
slot's **widest** rendered width across viewports and export at ×1.25, WebP q80 — that is
what `/optimize-images` does.

**Status:** 19 slots empty, 3 filled (home service cards, this pass).

---

## Priority 1 — live pages, visible to every visitor

| Page | Slot | Measured | Export | Alt already written (RO) |
| --- | --- | --- | --- | --- |
| Home | `page-hero-media` — **LCP** | 666×298 | **833w** | *Andreea Butacu așezată într-un fotoliu, într-o încăpere luminoasă cu plante* |
| Home | `AboutJourney` split | 501×466 | **626w** | *Andreea Butacu în cabinet, așezată într-un fotoliu lângă o bibliotecă* |
| Resources | `page-hero-media` | 666×298 | **833w** | *Cană de ceai și cărți pe o masă de lemn, lângă un vas cu eucalipt* |

> **Both home slots need photos of Andreea herself**, not stock interiors — the alt text
> names her. These are the two that carry the most weight: the hero is the LCP element,
> and the About split is the first time a visitor sees her face.

### Resources cards — 6 slots

| Group | Count | Measured | Export | Alt theme |
| --- | --- | --- | --- | --- |
| Free guides | 3 | 120×152 | **150w** | guide covers (anxiety, journal, couple) |
| Premium guides | 3 | 129×279 | **161w** | printed guide / journal / stack of books |

Small slots — the horizontal `.media-card` layout gives the media 40% of the card.
Cover art, not photography.

---

## Priority 2 — data-driven, empty until content ships

Each content item declares `image: null` with `imageAlt: null` beside it. The component
renders a placeholder via `v-else`, so filling the field is all that is needed — no
markup change.

| Content | Items | File | Slot when shown |
| --- | --- | --- | --- |
| Articles | 2 | `src/content/articles/*.vue` | 545×160 home, 543×160 resources → **681w** |
| Events | 4 | `src/content/events/*.vue` | `atelier-image` (hidden page) |

Articles surface in two places (home `RecentArticles`, resources rail), so one file per
article covers both. Size for the larger: **681w**.

---

## Priority 3 — hidden routes, not launched

`/ateliere`, `/grupuri` and `/noutati` are in `HIDDEN_PATHS` (`src/seo.config.js:18`) —
off the nav and out of the sitemap by choice. Their placeholders do not block launch.

| Page | Slot | Note |
| --- | --- | --- |
| Events (`/ateliere`) | `page-hero-media` | route hidden |
| Events | 4× `atelier-image` | one per event, via `image: null` |

---

## Already done

| Slot | File | Export |
| --- | --- | --- |
| Home service cards ×3 | `assets/images/home/*-card.webp` | 558×372 |
| Service page heroes ×3 | `assets/images/services/*-hero.webp` | — |
| Service sections ×9 | `assets/images/services/*.webp` | — |
| About portrait | `assets/images/about/andreea-portrait.webp` | — |
| Contact ×2 | `assets/images/contact/*.webp` | — |

---

## How to fill one

1. Drop sources in `D:/image-jobs/psihoterapeut/<section>/`.
2. Run `/optimize-images`, pointing at that folder and the target section.
3. It measures the live slot, exports at ×1.25, and patches the markup.

For a `v-else` slot (articles, events) there is no markup to patch — set `image` and
`imageAlt` in the content file's `meta` and the placeholder disappears on its own.
