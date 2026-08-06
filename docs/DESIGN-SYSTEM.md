# Design System — Psihoterapeut

How this site is built and why. Read this **before writing any markup or CSS** — most of what a new page needs already exists here, and the pieces that look like judgement calls are settled decisions with reasons behind them.

Companion to [PROJECT-STATUS.md](./PROJECT-STATUS.md) (what state the project is in) and [PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md) (the launch gate). This one is about *how things should look and be built*.

Everything global lives in [`src/assets/base.scss`](../src/assets/base.scss). Everything else is scoped to its component.

**Last updated:** 2026-08-06 · written after the `/services` build, revised after the Home / Ateliere / Resurse consolidation pass that promoted the shared card, link and media-fade utilities, then again after the responsive pass that made the scale fluid and the grids width-driven — see §6.

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

**Every size token below is a `clamp()`, not a literal.** The value shown is the desktop maximum;
each one scales down continuously with the viewport, which is why almost nothing needs a media
query to shrink. See §6.

| Token | Range (min → max) | Use for |
|---|---|---|
| `--vt-c-section-gap` | `1rem` → `2rem` | Vertical rhythm — consumed by `.layout-stack > * + *` |
| `--vt-c-split-gap` | `1rem` → `2rem` | Horizontal gap inside `.split-section`; also the "wide gap" any grid opts into |
| `--vt-c-section-padding` | `2rem` → `4rem` | Padding on full-bleed bands |
| `--stack-gap-loose` | `1.25rem` → `2rem` | What `.stack-loose` sets `--stack-gap` to |
| `--page-gutter` | `1rem` → `3rem` | The page's side gutter. `.main-content`, `.layout-container`, `.section-band` and the nav all read it, so they stay aligned. |
| `--page-pad-top` / `-bottom` | `5rem` → `10rem` / `3rem` → `8rem` | The page frame — see below |
| `--card-padding` | `1.1rem` → `2rem` | `.card` and `form` |
| `--card-padding-compact` | `1rem` → `1.5rem` | `.card-compact`, and the offset `.card-media` cancels |
| `--card-grid-gap` | `0.75rem` → `1.5rem` | Default `.card-grid` gap |
| `--icon-chip-size` | `2.25rem` → `3rem` | `.icon-chip` |
| `--vt-c-media-min-height` | `12rem` → `24rem` | `.media-placeholder`, `.split-image`, `.contact-photo` |
| `--step-h1` … `--step-card-title` | | The type scale — `h1`/`h2`/`h3`/`.card-title` read these and nothing else |
| `--vt-c-container-width` | `1200px` | Max content width (fixed) |
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

`.main-content` in `App.vue` is `padding: var(--page-pad-top) var(--page-gutter) var(--page-pad-bottom)` — three tokens, not one shorthand. A page whose hero runs flush to the top behind the fixed nav zeroes **only the token it needs** in its own scoped root rule:

```scss
.page-home { --page-pad-top: 0; --page-pad-bottom: 0; }
.events-page { --page-pad-top: 0; }
```

`App.vue` never learns page names, and the frame stays retunable from `:root` — a page that overrode the whole shorthand would opt itself out of every future change to it.

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

⚠️ **`.card-media` is coupled to `--card-padding-compact`.** It cancels the card's padding with `width: calc(100% + 2 * var(--card-padding-compact))` and a matching negative margin. That padding is now fluid, so both must read the token — hardcode either side and the media stops meeting the card edge at some widths but not others. `Areas.vue`'s `.home-area-card .media-card-body` carries the same coupling.

### Lists

| Class | Purpose |
|---|---|
| `.dot-list` | Bulleted list, `0.75rem` gap, no native marker |
| `.dot-list-columns` | Modifier — two columns where the width allows. Applied at ≥ 8 items (see §7). |
| `.dot-list-item` | Row: `flex`, `align-items: flex-start` |
| `.dot-list-bullet` | The bullet — `<CircleSmall :size="16" />`, outline, green |

**The bullet is always the same thing**: lucide `CircleSmall` at 16, outline (not filled), coloured green via `.dot-list-bullet`. Not a native `list-style`, not a `::before`, not a checkmark.

### Icon grid

`.icon-grid` / `.icon-grid-item` / `.icon-grid-icon` — grid where each item carries its **own semantic icon** at `:size="22"`. Two columns at most widths, driven by a `10.5rem` track minimum so it holds two even inside a narrowed `.split-body`. Use when the items are concepts worth distinguishing; use `.dot-list` when they're a plain enumeration.

### Blocks

| Class | Purpose |
|---|---|
| `.card` | `--vt-c-surface` background, `--vt-c-radius-lg`, `--card-padding` |
| `.card-compact` | Modifier — `--card-padding-compact`. Pairs with `.card-media`. |
| `.card-outlined` | Modifier — 1px `--vt-c-jannafer-gray2` border |
| `.card-link` | The card **is** the `<a>`: hover recolours it and nudges its `.link-arrow` |
| `.card-title` | Serif card heading — Libre Baskerville 400 at `--step-card-title` |
| `.card-grid` | Width-driven card grid. Set `--card-min` (and `--card-grid-gap` for a wider gutter) — see §6. |
| `.link-arrow` | Text link with a trailing arrow that nudges on hover. Reads the same as `<a>` or `<button>`. |
| `.section-head` / `.section-head-center` | Section heading rows — see §5 for which to use |
| `.section-intro` | Lead paragraph under a section head, capped at `60ch` |
| `.cta-band` | Closing call-to-action. Ships as the `CtaBand` component — see §4. |
| `.credentials` | The practitioner's qualifications stack, above a page's leading heading. Sub-part `-icon`. |
| `.icon-chip` | Circular icon badge on `--vt-c-surface-strong`, sized by `--icon-chip-size` |

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
.card-media {
    height: var(--card-media-height, 10rem);              // fixed, so width/height attrs don't letterbox
    width: calc(100% + 2 * var(--card-padding-compact));  // spans the card's padding on both sides
    margin: calc(-1 * var(--card-padding-compact)) calc(-1 * var(--card-padding-compact)) 0;
    border-radius: var(--vt-c-radius-lg) var(--vt-c-radius-lg) 0 0;   // only the outer corners
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

Direction defaults to `to top` (a card header dissolving downward) and is retuned with `--media-fade-to`; `--media-fade-stop` moves where the image reaches full opacity. `.bleed-left` / `.bleed-right` set the direction for you. Under 768px, where they stack, they set `--media-fade-stop: 0%`, which makes the gradient fully opaque — there is no column left to blend into. `.media-card-media` flips to `to top` at 480px for the same reason.

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

Under 768px it reverts to a normal rounded block — stacked, there's no column left to bleed against.

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

## 6. Responsive

**The rule: a card grid never drops to one column above 480px. A two-column split stacks at 768px.**
Between those, things get *smaller* — they do not get *fewer*.

The failure this replaced: a grid went from three 370px cards to one 990px card the moment the
viewport crossed 1024, a 2.7× jump, while `2rem` paddings and a `10rem` page padding stayed put
all the way to 320px.

### Two mechanisms, and they do different jobs

**1. Fluid tokens handle every size.** Type, gaps, padding, icon and media heights are `clamp()`
values in `:root` (§2). They scale continuously, so there is no width at which a size suddenly
jumps — and no media query needed to shrink anything. **If you find yourself writing a media query
to change a `font-size`, `padding` or `gap`, you want a token instead.**

**2. Media queries handle shape only** — row becoming column, and the rare fixed column count.
There are three widths and they mean specific things:

| Width | What changes |
|---|---|
| `1024` | Splits narrow their media column (`.split-media { flex-basis: 38% }`). Nothing stacks. |
| `768` | Splits stack: `.split-section`, `.page-hero`, `.cta-band`, `.about-hero`, `.newsletter-card`, `.contact-reach` / `-after` / `-closing`, plus `.form-row` and `.section-head` |
| `480` | `.media-card` stacks its image above its copy; `.columns-container` and `.contact-steps-list` go column |

Form rows and the newsletter field pair deliberately stack at **768, not 480** — two inputs side by
side at 481px are ~210px each, which is below usable. The 480 rule is about content sections, not
input rows.

### Grid columns come from a width, not a count

`.card-grid` is `repeat(auto-fit, minmax(min(var(--card-min, 16rem), 100%), 1fr))`. A grid declares
how narrow its card may get and the track count follows:

```scss
.services-list { --card-min: 18rem; }   // 3 / 3 / 2 / 1 across 1440 / 1024 / 768 / 480
```

The track count then steps down one at a time, so the jump the old ladder produced cannot happen.
`min(…, 100%)` is load-bearing: without it a track wider than the viewport overflows.

**`auto-fit` collapses only tracks that are empty in *every* row** — a lone last item still occupies
one track, it does not stretch across the row. But a grid with fewer items than tracks *does* share
the full width between them, which is why `/articles` shows two very wide cards while the store
holds only two articles. That self-corrects as content lands.

### When to state the column count instead

Four grids override `grid-template-columns` directly: `.home-reasons-grid` (6 items),
`.home-work-grid` (4), `.about-cards` (4), `.resources-practical-grid` (4).

**Use an explicit count when the item count is fixed and small.** A width-driven track count will
eventually land on a number that doesn't divide the item count and strand the last card on its own
row — 6 items in 5 tracks, 4 in 3. Open-ended collections (`/news`, `/services`, events, articles)
have no such problem and should stay `--card-min`.

The cost is a jump: 4-across to 2-across roughly doubles the track width, because with four items
there is no valid 3. That trade is deliberate — a stranded card reads as a bug, a size change does
not — but it is the reason to reach for `--card-min` first.

`.home-work-grid`'s dividing rules live in the same `min-width: 900px` block that sets its 4
columns, because a left rule only makes sense while all four share a row.

### Checking a change

Measure, don't eyeball — `html { overflow-x: clip }` hides horizontal overflow, so a broken
full-bleed looks fine until someone opens it on a phone. At 1440 / 1024 / 768 / 480:

- computed width of every grid item, and the **ratio between adjacent breakpoints** — anything past
  ~1.6× is the old bug coming back
- any element whose `getBoundingClientRect().right > window.innerWidth`
- Chrome's window will not go below ~500px; use device emulation for a true 480

### The nav has its own breakpoint

`Navigation.vue` switches to the hamburger at **1150px**, not 1024 — that is the width where the
logo, six links and the two toggles stop fitting the bar. Tying it to the page breakpoint left
1025–1150px overflowing off-screen with no hamburger to fall back to.

---

## 7. Unresolved

Real inconsistencies in the current code. **Do not copy these as though they were decisions** — they need a call.

1. **`.dot-list-columns` triggers at ≥ 8 items.** Carieră's "Poate te regăsești aici" goes two-column while the same section on the other two pages stays single — a visible inconsistency driven by item count rather than intent. Either force one column per section type, or move the choice into the content data.

2. **Icon-grid semantics are half-derived.** 8 of the 25 icons are read off the Infertilitate mock; the other 17 (Maternitate, Carieră) were chosen — those mocks had no icon grid to copy. Worth a review pass.

3. **`Reasons.vue` and `HowIWork.vue` map icons to i18n items by array index.** Add a seventh entry to `home.reasons.items` and it silently renders with no icon. The fix is a `content/home/index.js` following the list-config convention above, but that is its own change.

4. **Breakpoints are still magic numbers, but far fewer and more varied.** 17 media-query blocks, down from 33 hardcoded values, and they now do one job (shape changes). Six of them are *not* on the 1024/768/480 grid — `1150` (nav), `1100` / `900` / `560` (fixed column counts), `640` (About's prose measure) — each set to the width where that specific layout actually breaks rather than to a shared number. That is deliberate, and it is also why the SCSS-variable treatment via the commented-out `additionalData` block in `vite.config.js` buys less than it used to. The four unscaled z-indexes are untouched. Left open.

5. **`Articles.vue` / `ArticleItem.vue` / `NewsItem.vue` / `events/Event.vue` predate the design system.** They now sit on the shared grid and page frame, but still render their own visual language — box shadows, `10px` radii, no `.card` composition. Needs a design call, not a refactor.

6. **`.home-faq-grid` runs 3-across above ~1200px**, where §3 describes the FAQ as a two-column block. Three columns fill the width better and 6 items divide evenly into both 3 and 2, so the ladder is clean — but it is a change from the documented intent, not a considered redesign.

**Resolved in the 2026-08-06 responsive pass** (was items 1, 4, 6-partial): `.split-flush`'s literal `gap: 2rem` is gone — `--vt-c-split-gap` is fluid, which is what that override was faking. The global `h1` is now a single `clamp()` with no per-breakpoint rules, so pages no longer fight three declarations.

**Resolved in the 2026-08-05 pass**: card padding and the bypassed `.card` are now `.card-compact` / `.card-outlined`; the `1rem` radius is `--vt-c-radius-lg`; the dead starter-theme tokens and the dangling `var(--vt-c-indigo)` are gone.
