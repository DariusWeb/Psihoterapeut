# psihoterapeut

Vue 3 + Vite. Romanian psychotherapy practice site, base path `/Psihoterapeut/`.

## Before touching any CSS

**A full redesign is in progress (2026-10-21).** Read `docs/REDESIGN-2026-10-21.md` first —
its "Resume here" block is the handoff, its decisions are settled. Styling source of truth, in
order: `design_handoff/designs/Design System v4.dc.html` > `design_handoff/tokens.css` > the
page mock > `design_handoff/github.md`. `docs/DESIGN-SYSTEM.md` is **superseded** until the
redesign's last phase rewrites it — never copy its values.

**Existing content wins:** copy, logo, images and contact data stay as they are; the redesign
changes design, tokens and consistency only.

## The rules that matter most

**Consistency is the goal, not correctness in isolation.** The same decision made the
same way in every section is what produces rhythm. A value that differs needs a reason,
and a reason that applies only once gets **flagged to the owner as an exception** — never
quietly localised.

1. **If a token exists, a literal is a bug.** Tokens are the `tokens.css` names in
   `base.scss` (`--fs-*`, `--lh-*`, `--s-*`, `--r-*`, `--olive-*`, `--t-*`…). A value DS v4
   doesn't list snaps to the closest token. `--vt-c-*` and `--step-h*` are temporary aliases
   for un-migrated pages — new code never reads them.
2. **Sizes switch through tokens, once, below 768** (the `max-width: 767px` block in
   `base.scss`). A component media query changes shape only — row to column, column count.
3. **Icon and title share the first line; the description starts under the icon, at its
   left edge.** Centre the icon on the first line with `calc((1lh - <icon size>) / 2)`,
   never a hand-tuned `margin-top`. The "Pentru tine" panel is the only exception.
4. **A fixed flex basis needs `min-width: 0` and `flex: 1 1`.** `flex: 0 0 X%` overflows
   the viewport in the band between "row is tight" and "row stacks" — and `overflow-x:
   clip` hides it.
5. **Every hover affordance needs a touch path.** No `mouseenter` fires on a phone. If
   hover reveals or enables something, click or focus must do the same. Guard genuinely
   decorative effects with `@media (hover: hover)`.
6. **Never crop an image to fit a slot.** Cap the height, keep the full frame.
7. **Measure, don't eyeball.** `html { overflow-x: clip }` hides horizontal overflow, so a
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
