# Responsive system

Everything in this folder except `tokens.sass` is auto-injected into **every**
`<style lang="sass">` block in the app (see `css.preprocessorOptions.sass` in
`vite.config.ts`). No imports needed — the mixins and `fluid()` are just there.

## Reach for these in order

1. **A fluid token or `fluid()`** — no breakpoint at all
2. **An intrinsic layout mixin** — `+auto-grid`, `+switcher`
3. **A container query** — `+cq-down`, when the component's own width is what matters
4. **A viewport query** — `+mobile`, `+down(lg)`, for genuine layout switches
5. **`useBreakpoint()`** — only when CSS cannot express it

Most components should never get past step 2.

## 1. Fluid tokens

Defined in `tokens.sass`, emitted as custom properties on `:root`. Every value
interpolates between 360px and 1440px of viewport width and clamps outside it.

```sass
.card
  padding: var(--space-m)
  gap: var(--space-2xs)
  font-size: var(--step-0)
```

- Type: `--step--2` … `--step-5`, where `--step-0` is body text
- Space: `--space-3xs` … `--space-3xl`
- Shell: `--page-gutter`, `--content-max-width`, `--tap-target-size`

For a one-off that doesn't fit the scale, call `fluid()` directly. Both bounds
must be in `rem`:

```sass
.hero__title
  font-size: fluid(1.5rem, 3rem)
```

`tokens.sass` is the only place that should call `fluid()` for a scale value.

## 2. Intrinsic layout

These reflow on their own, at the element's own width:

```sass
.course-list
  +auto-grid(18rem)      // as many 18rem columns as fit, 1 when they don't

.toolbar
  +switcher(20rem)       // a row until children can't hold 20rem, then a stack

.page
  +content-column        // centred, max-width, fluid gutters

.wide-table
  +scroll-x              // scrolls itself instead of the page
```

## 3. Container queries

Use when a component is rendered at different widths on the _same_ viewport —
inside a pane, a sidebar, a grid cell. A viewport query gets these wrong by
definition: wide window + narrow pane still matches the desktop branch.

```sass
.noo-card
  +container(card)       // declare the container, name it

  &__body
    display: flex

    +cq-down(sm, card)   // < 30rem of card, whatever the window is
      flex-direction: column
```

Sizes: `xs` 20rem, `sm` 30rem, `md` 40rem, `lg` 48rem, `xl` 64rem. A raw length
works too: `+cq-down(35rem)`.

Two gotchas:

- `container-type: inline-size` means children can no longer influence the
  element's width. Put `+container` on a wrapper whose width its parent already
  decides — a grid/flex child, a card shell, a pane.
- Always name the container when a component nests others, or the nearest
  ancestor wins.

Good candidates not yet converted: `noo-entity-table`, `noo-card`,
`noo-user-card`, `noo-file-card`, `noo-pane`, the chart components.

## 4. Viewport queries

```sass
.header
  display: grid

  +mobile              // < 768px
    grid-template-columns: auto 1fr

  +desktop             // >= 992px
    gap: var(--space-m)

  +down(xl)            // < 1200px
  +up(sm)              // >= 576px
  +between(md, lg)     // 768px .. 991.98px
```

Named breakpoints: `sm` 576, `md` 768, `lg` 992, `xl` 1200, `xxl` 1400 —
the same ones as the Bootstrap grid loaded in `index.html`.

Semantic aliases: `+mobile` (< md), `+tablet` (md..lg), `+tablet-down` (< lg),
`+desktop` (>= lg).

Capability queries, for when width was never the real question:

```sass
.tooltip
  +hover-capable       // has a fine pointer that can hover
    display: block

.button
  +touch               // coarse pointer, no hover
    +tap-target

.panel
  +reduced-motion
    transition: none
```

## 5. `useBreakpoint()`

For decisions CSS can't make — rendering a different component, collapsing a
layout into a drawer, disabling a hover-only interaction.

```ts
import { useBreakpoint } from '@/core/composables/useBreakpoint'

const { isMobile, isDesktop, isTouch, smaller } = useBreakpoint()
```

The media query listeners are created once at module scope and shared by every
caller, so calling this in many components is cheap. Never re-implement it with
a `resize` listener and `window.innerWidth`.

## Changing a breakpoint

Three files have to agree:

- `src/assets/styles/_breakpoints.sass` — the `$breakpoints` map
- `src/core/config/breakpoints.config.ts` — the JS mirror
- `public/bootstrap-grid.min.css` — the `.col-*` classes
