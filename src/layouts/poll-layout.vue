<template>
  <div class="poll-layout">
    <div
      class="poll-layout__background"
      aria-hidden="true"
    >
      <span
        v-for="(blob, index) in blobs"
        :key="index"
        class="poll-layout__background__blob"
        :style="blob"
      />
    </div>
    <header class="poll-layout__header container">
      <div class="poll-layout__header__logo">
        <h1>НОО.Опросы</h1>
      </div>
      <div class="poll-layout__header__widgets">
        <noo-theme-toggle-widget />
        <noo-help-widget />
        <noo-button
          :to="{ name: 'root' }"
          variant="secondary"
        >
          К платформе
        </noo-button>
      </div>
    </header>
    <main class="poll-layout__content">
      <div class="poll-layout__content__card">
        <slot />
      </div>
    </main>
    <footer class="poll-layout__footer container">
      <noo-footer />
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

const blobColors = ['var(--secondary)', 'var(--primary)']

// Each blob drifts along its own vector, so they wander apart instead of
// sliding across the screen as one block.
const blobs: CSSProperties[] = [
  {
    '--blob-size': '18rem',
    '--blob-top': '-6%',
    '--blob-left': '-4%',
    '--blob-dx': '14rem',
    '--blob-dy': '9rem'
  },
  {
    '--blob-size': '11rem',
    '--blob-top': '12%',
    '--blob-left': '72%',
    '--blob-dx': '-11rem',
    '--blob-dy': '13rem'
  },
  {
    '--blob-size': '25rem',
    '--blob-top': '38%',
    '--blob-left': '18%',
    '--blob-dx': '9rem',
    '--blob-dy': '-12rem'
  },
  {
    '--blob-size': '14rem',
    '--blob-top': '55%',
    '--blob-left': '84%',
    '--blob-dx': '-15rem',
    '--blob-dy': '-8rem'
  },
  {
    '--blob-size': '9rem',
    '--blob-top': '78%',
    '--blob-left': '5%',
    '--blob-dx': '16rem',
    '--blob-dy': '-14rem'
  },
  {
    '--blob-size': '20rem',
    '--blob-top': '88%',
    '--blob-left': '48%',
    '--blob-dx': '-10rem',
    '--blob-dy': '-16rem'
  }
].map((blob, index) => ({
  ...blob,
  '--blob-color': blobColors[index % blobColors.length],
  '--blob-duration': `${11 + index * 2}s`,
  '--blob-delay': `${index * -3}s`
}))
</script>

<style lang="sass" scoped>
.poll-layout
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  overflow-x: hidden
  background-color: var(--light-background-color)

  &__background
    position: fixed
    inset: 0
    z-index: 0
    overflow: hidden
    pointer-events: none

    &__blob
      position: absolute
      top: var(--blob-top)
      left: var(--blob-left)
      width: var(--blob-size)
      aspect-ratio: 1
      border-radius: 50%
      background-color: var(--blob-color)
      opacity: 0.65
      filter: blur(1rem)
      animation: poll-layout-drift var(--blob-duration) ease-in-out var(--blob-delay) infinite alternate

      // A 25rem circle swallows a phone screen — keep the composition, shrink
      // the scale it is composed at.
      +mobile
        width: calc(var(--blob-size) * 0.55)

      +reduced-motion
        animation: none

  &__header
    display: flex
    flex-wrap: wrap
    align-items: center
    justify-content: space-between
    gap: var(--space-2xs) var(--space-s)
    padding-block: var(--space-s)

    // No room for a title on one side and three controls on the other — stack
    // them and centre both rows.
    +mobile
      flex-direction: column
      justify-content: center

    &__logo
      h1
        margin: 0
        font-size: fluid(1.1rem, 1.75rem)
        white-space: nowrap

        +mobile
          font-size: 1.6rem

    &__widgets
      display: flex
      flex-wrap: wrap
      align-items: center
      justify-content: flex-end
      gap: var(--space-3xs)

      // noo-button sizes itself in em, so scaling this row scales the
      // "К платформе" button down next to the icon widgets.
      +mobile
        font-size: 0.8em
        justify-content: center

  &__content
    +content-column(50rem)
    position: relative
    z-index: 1
    flex: 1 1 auto
    padding-block: var(--space-s) var(--space-l)

    &__card
      border-radius: var(--border-radius)
      background-color: var(--form-background)
      box-shadow: var(--block-shadow)
      padding: var(--space-m)

      +mobile
        padding: var(--space-s)

  &__footer
    position: relative
    z-index: 1
    margin-top: auto

// Three stops rather than two: played `alternate`, a blob wanders out along its
// vector, then swings past its start and back, instead of sliding to one spot
// and rewinding along the same line.
@keyframes poll-layout-drift
  0%
    transform: translate3d(0, 0, 0) scale(1)
  50%
    transform: translate3d(var(--blob-dx), var(--blob-dy), 0) scale(1.25)
  100%
    transform: translate3d(calc(var(--blob-dx) * -0.7), calc(var(--blob-dy) * 0.5), 0) scale(0.85)
</style>
