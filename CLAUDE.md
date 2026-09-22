# psihoterapeut

Vue 3 + Vite. Romanian psychotherapy practice site, base path `/Psihoterapeut/`.

## Before touching any CSS

**`docs/DESIGN-SYSTEM.md` is the styling source of truth.** Read §6 (Responsive) before
changing layout, spacing, type or icons. §7 lists known inconsistencies — those are open
questions, **not patterns to copy**.

The rules below are the ones most easily forgotten. The doc has the reasoning and the
exceptions for each.

## The rules that matter most

**Consistency is the goal, not correctness in isolation.** The same decision made the
same way in every section is what produces rhythm. A value that differs needs a reason,
and a reason that applies only once gets **flagged to the owner as an exception** — never
quietly localised.

1. **If a token exists, a literal is a bug.** Type is seven `--step-*` values, line height
   three `--leading-*`, gaps three `--gap-*` plus the fluid section tokens. Never a bare
   `0.9rem` or `0.75rem`. A size outside the scale means the scale needs a step — add it
   to `:root`, not to the component.
2. **Media queries change shape only** — row to column, and the rare fixed column count.
   Changing a `font-size`, `padding` or `gap` inside one means you want a token instead.
3. **Icons beside a title centre on the title's FIRST line.** Use `.icon-title-row`. Not
   `center`, not `baseline`, never a hand-tuned `margin-top`. The offset derives from
   `1lh` — the element's own line box — so it survives fluid type and wrapped titles.
   **Inverted when the icon is taller than the line** (an `.icon-chip`): centre the title
   on the icon instead.
4. **A fixed flex basis needs `min-width: 0` and `flex: 1 1`.** `flex: 0 0 X%` overflows
   the viewport in the band between "row is tight" and "row stacks" — and `overflow-x:
   clip` hides it.
5. **Bullets are hollow circles** (`CircleSmall` through `.dot-list`) everywhere.
   `.icon-grid`'s semantic per-item icons are a different component, not an exception.
6. **Every hover affordance needs a touch path.** No `mouseenter` fires on a phone. If
   hover reveals or enables something, click or focus must do the same. Guard genuinely
   decorative effects with `@media (hover: hover)`.
7. **A full-width button needs a `max-width`.** `width: 100%` + `max-width` +
   `margin-inline: auto`. Edge-to-edge is as wrong as stranded in whitespace.
8. **Never crop an image to fit a slot.** Cap the height, keep the full frame.
9. **Measure, don't eyeball.** `html { overflow-x: clip }` hides horizontal overflow, so a
   broken full-bleed looks fine until it is on a real phone. §6 "Checking a change" has
   the protocol — and check *between* breakpoints (800, 900), against a *wrapped* title,
   and with touch emulated, not just a narrow window.

## Conventions

- i18n keys go in `en.json` only. Romanian is a separate pass after a feature is done.
- Images: WebP, imported (never a `/public` path — the base path breaks those), explicit
  `width`/`height`, `loading="lazy"` unless it is the hero.
- All component styles are `scoped lang="scss"`. There is no SCSS variable injection —
  `vite.config.js`'s `additionalData` block is deliberately commented out — so tokens are
  CSS custom properties, read from `:root` in `src/assets/base.scss`.

## Verifying

`npm run dev` (serves on LAN via `--host`, so real devices can reach it), `npm run build`,
`npm run lint`. There is **no frontend test setup** — the only tests are Node scripts for
the Cloudflare Worker (`npm run worker:test`). Responsive changes are verified by
measuring in the browser, not by a test.

**Ask before driving Chrome DevTools.** Never navigate, screenshot or evaluate to verify
without an explicit go-ahead.

## Proposing a value to the owner

**Never ask a taste question as a table of selectors and values.** "7 sites at 0.3–0.4rem,
snap to 0.5?" is unanswerable — it names nothing the owner can picture and shows no
consequence. Once the DevTools go-ahead is given: size the viewport to the problem,
inject a temporary highlight so the **blast radius is visible**, apply one candidate live,
then ask with options matching what is on screen. The owner judges what they can see; you
measure what they can't. §6 "Proposing a value" has the full loop.
