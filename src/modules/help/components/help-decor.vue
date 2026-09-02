<template>
  <svg
    class="help-decor"
    :class="`help-decor--${variant}`"
    viewBox="0 0 1200 420"
    preserveAspectRatio="xMidYMin slice"
    aria-hidden="true"
    focusable="false"
  >
    <!--
      The flowing stroke the auth page draws behind its panel, redrawn to run
      under the hero. Round caps and a thick stroke are what make it read as a
      drawn line rather than a chart.
    -->
    <path
      class="help-decor__line"
      d="M-40 330C120 330 150 120 300 148C430 172 402 322 540 336C700 352 690 96 860 118C990 135 962 300 1090 306C1160 309 1210 250 1250 214"
    />
    <path
      class="help-decor__line help-decor__line--faint"
      d="M-40 392C150 392 210 214 366 240C500 262 470 380 610 392C780 406 760 168 930 190C1060 207 1040 356 1250 356"
    />

    <!-- Flat discs in the brand palette, the same vocabulary as the auth art. -->
    <circle
      class="help-decor__disc help-decor__disc--primary"
      cx="1042"
      cy="86"
      r="74"
    />
    <circle
      class="help-decor__disc help-decor__disc--secondary"
      cx="146"
      cy="70"
      r="42"
    />
    <circle
      class="help-decor__disc help-decor__disc--secondary"
      cx="928"
      cy="196"
      r="18"
    />
    <circle
      class="help-decor__disc help-decor__disc--secondary"
      cx="1136"
      cy="188"
      r="10"
    />
    <circle
      class="help-decor__disc help-decor__disc--primary"
      cx="64"
      cy="196"
      r="14"
    />
    <circle
      class="help-decor__disc help-decor__disc--primary"
      cx="238"
      cy="150"
      r="8"
    />

    <!-- An open ring, to break up the run of filled circles. -->
    <circle
      class="help-decor__ring"
      cx="196"
      cy="252"
      r="30"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  /**
   * `hero` draws the full arrangement behind a tall block; `band` keeps the
   * lines and drops the discs, for a short strip where they would crowd it.
   */
  variant?: 'hero' | 'band'
}

withDefaults(defineProps<Props>(), { variant: 'hero' })
</script>

<style scoped lang="sass">
// Decoration only: it sits under the content and never takes a click.
.help-decor
  position: absolute
  top: 0
  left: 0
  // An absolutely positioned <svg> is a replaced element: left/right alone
  // leave it at its intrinsic width rather than stretching it, so the width is
  // set outright.
  width: 100%
  pointer-events: none
  user-select: none

  // Anchored to the top at a fixed height rather than stretched to fill the
  // block. The hero grows and shrinks as search results replace the query chips,
  // and a decoration sized off that height would rescale — the whole background
  // visibly jumping on every keystroke.
  &--hero
    height: 26rem
    // Faded out along its last third rather than simply stopping: a fixed
    // height ends on a hard horizontal edge partway down the block, which reads
    // as a rendering fault rather than as decoration.
    -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%)
    mask-image: linear-gradient(to bottom, #000 55%, transparent 100%)

  // The contact band's height barely moves, so filling it is safe there. The
  // lines alone carry a short strip; the discs need height to sit in.
  &--band
    height: 100%

    .help-decor__disc,
    .help-decor__ring,
    .help-decor__arc
      display: none

  &__line
    fill: none
    stroke: var(--primary)
    stroke-width: 26
    stroke-linecap: round
    opacity: 0.55

    &--faint
      stroke: var(--secondary)
      stroke-width: 16
      opacity: 0.3

  &__disc
    &--primary
      fill: var(--primary)
      opacity: 0.5

    &--secondary
      fill: var(--secondary)
      opacity: 0.45

  &__ring
    fill: none
    stroke: var(--secondary)
    stroke-width: 6
    opacity: 0.5

  &__arc
    fill: none
    stroke: var(--primary)
    stroke-width: 10
    stroke-linecap: round
    opacity: 0.6

  // Dark themes take the same shapes further back — the brand colours are light
  // by design and would otherwise glare against the near-black ground.
  html.dark &
    .help-decor__line
      opacity: 0.22

    .help-decor__line--faint
      opacity: 0.14

    .help-decor__disc
      opacity: 0.18

    .help-decor__ring,
    .help-decor__arc
      opacity: 0.22

  // A narrow viewport scales the drawing up and crops it, which leaves the
  // outlined shapes reading as stray strokes rather than as figures.
  +mobile
    .help-decor__ring,
    .help-decor__arc
      display: none
</style>
