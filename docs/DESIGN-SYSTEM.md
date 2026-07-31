# Design System — Psihoterapeut

How this site is built and why. Read this **before writing any markup or CSS** — most of what a new page needs already exists here, and the pieces that look like judgement calls are settled decisions with reasons behind them.

Companion to [PROJECT-STATUS.md](./PROJECT-STATUS.md) (what state the project is in) and [PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md) (the launch gate). This one is about *how things should look and be built*.

Everything global lives in [`src/assets/base.scss`](../src/assets/base.scss). Everything else is scoped to its component.

**Last updated:** 2026-07-30 · written after the `/services` build (index + three detail pages), which is the reference implementation for most of what follows.

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
| `--vt-c-border-radius` | `.5rem` | Buttons and inputs. **Cards and media use `1rem`** — see §6. |
| `--vt-c-transition-speed` | `0.3s` | Every transition. Don't invent durations. |

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
| `.layout-stack` | Vertical rhythm. Applies `--vt-c-section-gap` **on the child** (`> * + *`), so a section can retune its own spacing. |
| `.section-tight` / `.section-flush` | Retune the gap to `1rem` / `0` |

### Split — image beside text, alternating

```
.split-section          flex row; :nth-of-type(even) reverses it
  .split-media          flex 0 0 45% — the image or placeholder
  .split-body           flex 1 — the copy
.split-flush            hero variant: media bleeds off the left edge
```

⚠️ **`.split-section` alternates on `:nth-of-type(even)`.** Every direct child of the page root must be a `<section>`. Insert one non-split element in the middle and every image below it flips sides. A single comment in `base.scss` says so — keep it.

⚠️ **`.split-media` needs `min-width: 0`.** Without it, `min-width: auto` floors the flex item at the image's intrinsic width and the edge bleed silently collapses.

### Media

`.media-placeholder` — tinted block (`--vt-c-surface-strong`) with a centred icon, filling the same box a real image would. This is a **supported state**, not scaffolding: `SplitSection` renders it whenever `image` is absent, so a page can be built and reviewed before photography exists.

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
| `.card` | `--vt-c-surface` background, `1rem` radius, `2rem` padding |
| `.cta-band` | Closing call-to-action: copy left, button + reassurance right. Sub-parts `-content` / `-action` / `-button` / `-note`. Stacks under 1024px. |
| `.credentials` | The practitioner's qualifications stack, above a page's leading heading. Sub-part `-icon`. |
| `.icon-chip` | 3rem circular icon badge on `--vt-c-surface-strong` |

`.cta-band` and `.credentials` are **page-agnostic** — drop them on any page, not just services.

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

### Deliberate non-extractions

Don't "helpfully" abstract these — the decision was to leave them inline:

- **The services index card** is three cards rendered in one `v-for` inside `Services.vue`. Fifteen lines of template; a component would add a file and a prop contract for nothing.
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

Photos dissolve into adjacent content rather than ending on a hard line:

```scss
mask-image: linear-gradient(to top, transparent, #000 30%);
```

Mirror the direction per edge (`to top` for a card header, `to right` / `to left` for a side-by-side hero). Always pair with the `-webkit-` prefix.

### Hover belongs to the whole card

The card **is** the `<a>`. Hovering it changes the background *and* nudges the arrow — the arrow never gets its own hover target:

```scss
.service-card-link:hover {
    background: var(--vt-c-surface-strong);
    .services-card-cta svg { transform: translateX(0.25rem); }
}
```

Put the transition on the moving element (`svg`), not the parent, so only the transform animates.

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

### Images

WebP, imported (never a raw `/public` path — the `/Psihoterapeut/` base path breaks those), with explicit `width`/`height` to reserve layout, `decoding="async"`, and `loading="lazy"` unless it's the hero.

---

## 6. Unresolved

Real inconsistencies in the current code. **Do not copy these as though they were decisions** — they need a call.

1. **Card padding is inconsistent.** `.card` is `2rem`; the services index card is `1.5rem` and hand-rolls its own `background` + `border-radius` rather than composing `.card`. Should the index card adopt `.card`, or should `.card` gain a compact modifier?

2. **`.split-flush` still declares `gap: 2rem`**, overriding `--vt-c-split-gap` and defeating the token for the hero specifically. Either drop the literal or make it a separate token.

3. **`.dot-list-columns` triggers at ≥ 8 items.** Carieră's "Poate te regăsești aici" goes two-column while the same section on the other two pages stays single — a visible inconsistency driven by item count rather than intent. Either force one column per section type, or move the choice into the content data.

4. **`.card` is bypassed in several places.** `About.vue`'s `.about-card` and `Services.vue`'s index card both hand-roll `border-radius: 1rem` + a background instead of composing `.card`. Three near-identical card treatments now exist.

5. **`1rem` card/media radius is a literal, not a token.** `--vt-c-border-radius` is `.5rem` and applies to buttons/inputs; every card and image uses a hardcoded `1rem`. Wants a second token (`--vt-c-border-radius-lg`).

6. **Icon-grid semantics are half-derived.** 8 of the 25 icons are read off the Infertilitate mock; the other 17 (Maternitate, Carieră) were chosen — those mocks had no icon grid to copy. Worth a review pass.

7. **Dead and broken tokens.** `--vt-c-text-light-1` resolves to `var(--vt-c-indigo)`, **which is never defined anywhere**. `--vt-c-main`, `--vt-c-white-soft`, `--vt-c-white-mute`, `--vt-c-black-soft`, `--vt-c-text-*` and `--vt-c-divider-dark-*` have no consumers in any component. Inherited from the Vue starter theme; needs a prune.

8. **The global `h1` fights every page.** `text-align: center` + `margin-bottom: 4rem` means nearly every page-specific `h1` overrides both. The global default is probably wrong.
