# Design System — Psihoterapeut

How this site is built and why. Read this **before writing any markup or CSS** — most of what a new page needs already exists here, and the pieces that look like judgement calls are settled decisions with reasons behind them.

Companion to [PROJECT-STATUS.md](./PROJECT-STATUS.md) (what state the project is in) and [PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md) (the launch gate). This one is about *how things should look and be built*.

Everything global lives in [`src/assets/base.scss`](../src/assets/base.scss). Everything else is scoped to its component.

**Last updated:** 2026-08-05 · written after the `/services` build, then revised after the Home / Ateliere / Resurse consolidation pass that promoted the shared card, link and media-fade utilities.

---

## 1. Principles

**Tokens, never literals.** Spacing, colour and timing come from `--vt-c-*`. A literal `2rem` or `#f5efe8` inside a component is a bug: it can't be retuned from the page, and it won't flip in dark mode.

**Extract on second use.** First occurrence stays local. The moment something is needed twice it becomes a global class or a component — `.cta-band` and `.credentials` were both promoted out of `ServiceDetail.vue` exactly this way. Don't pre-abstract on the first use; don't copy on the second.

**A class on every element that carries styling.** No bare tag selectors, no deep descendant chains. Each meaningful element gets a name that says what it is, so styles are greppable and safe to change.

**Shallow DOM.** No wrapper `<div>` that exists only to hold a style. `SplitSection` is three levels deep in total. If a structure needs four, question it first.

**Copy lives in `en.json`.** Never hardcode user-facing text in a template. `ro.json` is a single dedicated pass *after* features land — never write it during feature work.

**Icons are lucide only** (`@lucide/vue`), imported by name, sized with `:size`, coloured by setting `color` on the element (they inherit `currentColor`). No icon fonts, no inline SVG paths, no second icon library.

**Comment the non-obvious *why*, and keep it to one line.** Never restate what the code says. `// optical: aligns the dot to the first line's x-height` earns its place; `// set the gap` does not.

---

## 2. Tokens

Defined in `:root` at the top of `base.scss`.

### Colour

| Token | Value | Use for |
|---|---|---|
| `--vt-c-background` | `#faf6f3` | Page canvas. Sampled from the mock — see §5. |
| `--vt-c-jannafer-green` | `rgb(93, 107, 72)` | Brand green: headings, icons, links, primary fills |
| `--vt-c-jannafer-gray` | green @ 5% | Faintest tint — section backgrounds |
| `--vt-c-jannafer-gray2` | green @ 20% | Borders, secondary button fill |
| `--vt-c-on-accent` | `#ffffff` | Text **on** a green fill. Flips with the green — never hardcode white here. |
| `--vt-c-surface` | `#f5efe8` | Card background |
| `--vt-c-surface-strong` | `#e6e0d2` | Raised/placeholder blocks, card hover |
| `--vt-c-black` | `#181818` | Body text |
| `--vt-c-white` | `#ffffff` | Raised panels on the canvas |
| `--vt-c-error` / `--vt-c-success` | | Form feedback |

### Spacing, sizing, motion

| Token | Value | Use for |
|---|---|---|
| `--vt-c-section-gap` | `2rem` | Vertical rhythm — consumed by `.layout-stack > * + *` |
| `--vt-c-split-gap` | `2rem` | Horizontal gap inside `.split-section` |
| `--vt-c-section-padding` | `4rem 0` | Padding on full-bleed bands |
| `--vt-c-container-width` | `1200px` | Max content width |
| `--vt-c-border-radius` | `.5rem` | Buttons and inputs |
| `--vt-c-radius-lg` | `1rem` | Cards and media |
| `--vt-c-transition-speed` | `0.3s` | Every transition. Don't invent durations. |
| `--vt-c-shadow` / `-raised` | | Resting / lifted elevation. Deeper in dark mode, where a light shadow would vanish. |

### The two spacing tokens are the consistency mechanism

Spacing is retuned **by the page**, never overridden per element:

```scss
.service-page {
    --vt-c-section-gap: 1rem;   // vertical, between sections
    --vt-c-split-gap: 1rem;     // horizontal, inside each split
}
```

`.section-tight` (`1rem`) and `.section-flush` (`0`) do the same job for a one-off section. **Putting a local `gap:` on a section is the wrong answer** — it drifts from every other section and can't be retuned from above.

### Dark mode is free if you use tokens

Every token above is redefined under `html.dark`. A component built only from tokens gets dark mode automatically and needs **no `html.dark` rules of its own**. If you find yourself writing a dark-mode override, you probably hardcoded a colour.

Note `--vt-c-jannafer-green` is *lighter* in dark mode (`#a3b585`) — the light-mode green only reaches 2.9:1 on a dark canvas, below the 4.5:1 floor.

---

## 3. Global classes

### Layout

| Class | Purpose |
|---|---|
| `.layout-container` | Centres content at `--vt-c-container-width` with a 1rem gutter |
| `.layout-full` | Full-bleed: `margin-inline: calc(50% - 50vw)`. No `100vw`, no nudge hacks. |
| `.layout-stack` | Vertical rhythm **between** sections. Applies `--vt-c-section-gap` on the child (`> * + *`), so a section can retune its own spacing. |
| `.section-tight` / `.section-flush` | Retune the gap to `1rem` / `0` |
| `.stack` / `.stack-loose` | Vertical rhythm **inside** a section — flex column at `1rem` / `2rem` |

⚠️ **`.stack` and `.layout-stack` are not interchangeable.** `.layout-stack` reads its gap off the *child*, so putting it on a section to space that section's contents also retunes the gap above the section itself. Page rhythm is `.layout-stack`; anything inside a section is `.stack`.

### Page padding

`.main-content` in `App.vue` is `padding: var(--page-padding, 10rem 1rem 8rem)`. A page whose hero runs flush to the top behind the fixed nav sets `--page-padding` in its own scoped root rule — `App.vue` never learns page names.

### Split — image beside text, alternating

```
.split-section          flex row; :nth-of-type(even) reverses it
  .split-media          flex 0 0 45% — the image or placeholder
  .split-body           flex 1 — the copy
.split-flush            hero variant: media bleeds off the left edge
```

⚠️ **`.split-section` alternates on `:nth-of-type(even)`.** Every direct child of the page root must be a `<section>`. Insert one non-split element in the middle and every image below it flips sides. A single comment in `base.scss` says so — keep it.

⚠️ **`.split-media` needs `min-width: 0`.** Without it, `min-width: auto` floors the flex item at the image's intrinsic width and the edge bleed silently collapses.

### Page hero

`.page-hero` / `-content` / `-title` / `-intro` / `-media` — copy column beside media that bleeds off the viewport edge. `-content` carries the `7rem` top padding that clears the fixed nav. **Home, Ateliere, Resurse and Contact all use these** — do not write a page-local hero. About is the one exception: its photo is an inset column, not a bleed.

### Media

`.media-placeholder` — tinted block (`--vt-c-surface-strong`) with a centred icon, filling the same box a real image would. This is a **supported state**, not scaffolding: `SplitSection` renders it whenever `image` is absent, so a page can be built and reviewed before photography exists.

`.media-fade` — the dissolve (see §5). Direction and stop come from `--media-fade-to` / `--media-fade-stop`; both **inherit**, so the class can sit on the element itself or on a child image whose parent sets the direction.

`.bleed-left` / `.bleed-right` — media running off one viewport edge while the copy column stays on the container. Each sets `--media-fade-to` for you; add `.media-fade` to whichever element should actually dissolve.

`.card-media` — media that runs to the edge of a `.card-compact`, cancelling its padding. Height via `--card-media-height` (default `10rem`).

### Lists

| Class | Purpose |
|---|---|
| `.dot-list` | Bulleted list, `0.75rem` gap, no native marker |
| `.dot-list-columns` | Modifier — two columns. Applied at ≥ 8 items (see §6). |
| `.dot-list-item` | Row: `flex`, `align-items: flex-start` |
| `.dot-list-bullet` | The bullet — `<CircleSmall :size="16" />`, outline, green |

**The bullet is always the same thing**: lucide `CircleSmall` at 16, outline (not filled), coloured green via `.dot-list-bullet`. Not a native `list-style`, not a `::before`, not a checkmark.

### Icon grid

`.icon-grid` / `.icon-grid-item` / `.icon-grid-icon` — two-column grid where each item carries its **own semantic icon** at `:size="22"`. Use when the items are concepts worth distinguishing; use `.dot-list` when they're a plain enumeration.

### Blocks

| Class | Purpose |
|---|---|
| `.card` | `--vt-c-surface` background, `--vt-c-radius-lg`, `2rem` padding |
| `.card-compact` | Modifier — `1.5rem` padding. Pairs with `.card-media`. |
| `.card-outlined` | Modifier — 1px `--vt-c-jannafer-gray2` border |
| `.card-link` | The card **is** the `<a>`: hover recolours it and nudges its `.link-arrow` |
| `.card-title` | Serif card heading — Libre Baskerville 400 at `1.1rem` |
| `.link-arrow` | Text link with a trailing arrow that nudges on hover. Reads the same as `<a>` or `<button>`. |
| `.section-head` / `.section-head-center` | Section heading rows — see §5 for which to use |
| `.section-intro` | Lead paragraph under a section head, capped at `60ch` |
| `.cta-band` | Closing call-to-action. Ships as the `CtaBand` component — see §4. |
| `.credentials` | The practitioner's qualifications stack, above a page's leading heading. Sub-part `-icon`. |
| `.icon-chip` | 3rem circular icon badge on `--vt-c-surface-strong` |

**Compose the card, don't rebuild it.** A bordered, tightly-padded card is `class="card card-compact card-outlined"` — never a local rule that re-declares background, radius and padding.

---

## 4. Components

### `SplitSection` — [`src/components/common/SplitSection.vue`](../src/components/common/SplitSection.vue)

The one shared visual component. Structure only; all sizing and alternation live in the global classes above.

| Prop | Effect |
|---|---|
| `image` | The photo. Omit → renders `.media-placeholder`. |
| `alt` | Alt text. Also becomes the placeholder's `aria-label`. |
| `flush` | Hero variant — media bleeds off the left edge, copy sits bare on the page with no card |
| `priority` | LCP lever: `eager` + `fetchpriority="high"`. **Hero only** — everything below the fold stays lazy. |

Content goes in the default slot, so the caller decides whether the copy sits in a `.card` or bare.

### `CtaBand` — [`src/components/common/CtaBand.vue`](../src/components/common/CtaBand.vue)

The closing call-to-action every page ends on. Props `title`, `text`, optional `icon` (a lucide component rendered before the title). The button and the reassurance note are **fixed** — they read `cta.button` / `cta.note` and always point at `/contact#contact-form`, because that is the one action the whole site drives toward. Used by Home, Ateliere, Resurse and every service page.

### Deliberate non-extractions

Don't "helpfully" abstract these — the decision was to leave them inline:

- **`ServiceDetail.vue` renders all three service pages** from a data description. Adding a fourth page is a data entry, not a new component.

---

## 5. Settled patterns

Techniques that are decided. Copy these rather than inventing an alternative.

### Edge-to-edge media inside a padded card

Cancel the card's padding on the media instead of zeroing the card and re-padding the body:

```scss
.services-card-media {
    height: 12rem;                    // fixed, so width/height attrs don't letterbox the card
    width: calc(100% + 3rem);         // spans the card's 1.5rem padding on both sides
    margin: -1.5rem -1.5rem 0;
    border-radius: 1rem 1rem 0 0;     // only the outer corners
    object-fit: cover;
}
```

The photo goes flush to the card edge while the text keeps its inset, and the body needs no extra wrapper.

### Mask, don't hard-crop

Photos dissolve into adjacent content rather than ending on a hard line. **Never type the gradient — add `.media-fade`:**

```html
<img class="card-media media-fade" …>                        <!-- fades into the card body below -->
<div class="page-hero-media media-fade bleed-right" …>        <!-- fades into the copy column beside it -->
```

Direction defaults to `to top` (a card header dissolving downward) and is retuned with `--media-fade-to`; `--media-fade-stop` moves where the image reaches full opacity. `.bleed-left` / `.bleed-right` set the direction for you. Under 1024px they set `--media-fade-stop: 0%`, which makes the gradient fully opaque — stacked, there is no column left to blend into.

The `#000` inside the gradient is **not a colour**. A mask reads alpha only; `#000` means "opaque". Don't token-ise it.

### Hover belongs to the whole card

The card **is** the `<a>`. Hovering it changes the background *and* nudges the arrow — the arrow never gets its own hover target. This is `.card-link`, and the arrow is `.link-arrow`:

```html
<RouterLink class="card card-compact card-link" :to="…">
    <img class="card-media media-fade" …>
    <h2 class="card-title">…</h2>
    <span class="link-arrow">… <ArrowRight :size="16" /></span>
</RouterLink>
```

The transition lives on the moving element (`svg`), not the parent, so only the transform animates.

### Section headings: centred markets, left-aligned indexes

Two patterns, one deliberate split — pick by what the page is doing, don't copy whatever was nearest:

- **`.section-head-center`** + a `<Leaf class="section-flourish">` — the marketing rhythm. Home only. A `.link-arrow` inside it is positioned to the right of the centred title automatically, and rejoins the flow under 768px.
- **`.section-head`** — title left, `.link-arrow` right. Index and listing pages (Ateliere, Resurse), where the heading is a label on a collection rather than a beat in a narrative.

### One-sided full bleed

Media that runs off one viewport edge while its sibling column stays on the container:

```scss
flex: 0 0 calc(50vw - 5%);
margin-left: calc(50% - 50vw);      // margin-right to bleed the other way
border-radius: 0 1rem 1rem 0;       // only the inner corners
```

Under 1024px it reverts to a normal rounded block — stacked, there's no column left to bleed against.

### Optical alignment beats box alignment

`.dot-list-bullet` uses `margin-top: 0.3rem` so the dot sits on the first line's x-height rather than its box top. Icons in `.icon-grid-icon` use `0.15rem` for the same reason. Box-aligned markers read as too high next to text.

### Nested routes preserve `router-link-active`

`/services/:slug` is a **child** of `/services`, not a sibling:

```js
{ path: '/services', children: [
    { path: '',      name: 'services', component: … },
    { path: ':slug', name: 'service',  component: … },
]}
```

`router-link-active` matches on route *ancestry*, not URL prefix. As siblings, the nav highlight drops off on detail pages.

### Transition-gated scroll restore

`scrollBehavior` returns a promise resolved by a `page-transition-done` event that `App.vue` fires on the transition's `@after-leave`. Without it, `mode="out-in"` jumps the still-visible old page to the top before it finishes leaving.

### Sample the mock, don't eyeball colours

`--vt-c-background: #faf6f3` was derived by decoding the mock PNG and taking the modal colour across all four outer margins (12,800 samples; the winner held 31.8%, the rest ±1 noise). Guessing "a warm cream" would have landed somewhere else.

⚠️ **The canvas colour is duplicated in three places** — `--vt-c-background`, `--nav-bg` (a translucent copy), and the anti-flash paint in [`index.html`](../index.html). Change one without the others and you get a flash of the old colour on every cold load.

### Content shape vs. copy

Two files, two jobs:

- **`content/<collection>/index.js`** — structure: section keys, section type, icon lists, image imports
- **`en.json`** — the words, keyed `services.<key>.<section>.<field>`

Adding a page is a data entry in the first plus a copy block in the second. No new component, no new route.

**But `content/` holds two different kinds of thing, and they follow opposite rules:**

- **List-config** — `services`, `resources`, `groups`. A fixed set of cards the site itself defines. Keys + icons in the content file, **all copy in `en.json`**.
- **Item-content** — `articles`, `events`. Individually authored pieces, each its own `.vue` with a `meta` block and a body. **Copy lives inline**, in Romanian, because translating a whole article is not a UI-string job.

If you find yourself writing a sentence in a list-config file, it belongs in `en.json`.

### Images

WebP, imported (never a raw `/public` path — the `/Psihoterapeut/` base path breaks those), with explicit `width`/`height` to reserve layout, `decoding="async"`, and `loading="lazy"` unless it's the hero.

---

## 6. Unresolved

Real inconsistencies in the current code. **Do not copy these as though they were decisions** — they need a call.

1. **`.split-flush` still declares `gap: 2rem`**, overriding `--vt-c-split-gap` and defeating the token for the hero specifically. Either drop the literal or make it a separate token.

2. **`.dot-list-columns` triggers at ≥ 8 items.** Carieră's "Poate te regăsești aici" goes two-column while the same section on the other two pages stays single — a visible inconsistency driven by item count rather than intent. Either force one column per section type, or move the choice into the content data.

3. **Icon-grid semantics are half-derived.** 8 of the 25 icons are read off the Infertilitate mock; the other 17 (Maternitate, Carieră) were chosen — those mocks had no icon grid to copy. Worth a review pass.

4. **The global `h1` fights every page.** `text-align: center` + `margin-bottom: 4rem` means nearly every page-specific `h1` overrides both. The global default is probably wrong.

5. **`Reasons.vue` and `HowIWork.vue` map icons to i18n items by array index.** Add a seventh entry to `home.reasons.items` and it silently renders with no icon. The fix is a `content/home/index.js` following the list-config convention above, but that is its own change.

6. **Breakpoints and z-index are magic numbers.** 33 hardcoded `1024px` / `768px` and four unscaled z-indexes. Custom properties don't work in media queries, so this needs SCSS variables via the commented-out `additionalData` block in `vite.config.js`.

7. **`Articles.vue` / `ArticleItem.vue` / `events/Event.vue` predate the design system.** Three markups now render the same stores in a third visual language (box shadows, `8px` radii, no card composition). Needs a design call, not a refactor.

**Resolved in the 2026-08-05 pass** (was items 1, 4, 5, 7): card padding and the bypassed `.card` are now `.card-compact` / `.card-outlined`; the `1rem` radius is `--vt-c-radius-lg`; the dead starter-theme tokens and the dangling `var(--vt-c-indigo)` are gone.
