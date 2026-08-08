<template>
  <div class="cards-quiz-layout">
    <div
      class="cards-quiz-layout__backdrop"
      aria-hidden="true"
    >
      <span
        class="cards-quiz-layout__backdrop__glow cards-quiz-layout__backdrop__glow--primary"
      />
      <span
        class="cards-quiz-layout__backdrop__glow cards-quiz-layout__backdrop__glow--secondary"
      />
    </div>

    <header class="cards-quiz-layout__header">
      <div class="cards-quiz-layout__header__lead">
        <noo-icon
          name="cards"
          class="cards-quiz-layout__header__lead__icon"
        />
        <h1 class="cards-quiz-layout__header__lead__title">
          Квиз по карточкам
        </h1>
      </div>
      <div class="cards-quiz-layout__header__widgets">
        <noo-theme-toggle-widget />
        <noo-button
          variant="secondary"
          size="small"
          :to="{ name: 'task-cards.list' }"
        >
          Выйти
        </noo-button>
      </div>
    </header>

    <main class="cards-quiz-layout__stage">
      <div class="cards-quiz-layout__stage__inner">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped lang="sass">
.cards-quiz-layout
  position: relative
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  overflow-x: hidden
  background-color: var(--light-background-color)

  // Two still glows rather than the drifting blobs of the poll layout: the same
  // family of background, but nothing moving next to a card being read.
  &__backdrop
    position: fixed
    inset: 0
    z-index: 0
    overflow: hidden
    pointer-events: none

    &__glow
      position: absolute
      width: 36rem
      aspect-ratio: 1
      border-radius: 50%
      opacity: 0.35
      filter: blur(6rem)

      +mobile
        width: 20rem
        filter: blur(3.5rem)

      &--primary
        background-color: var(--primary)
        top: -14rem
        left: -10rem

      &--secondary
        background-color: var(--secondary)
        bottom: -16rem
        right: -12rem

  &__header
    +content-column(64rem)
    position: relative
    z-index: 1
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: var(--space-2xs)
    padding-block: var(--space-s)

    &__lead
      display: flex
      align-items: center
      gap: var(--space-3xs)
      min-width: 0

      &__icon
        font-size: 1.6em
        flex-shrink: 0

      &__title
        margin: 0
        font-size: fluid(1.1rem, 1.5rem)
        white-space: nowrap

    &__widgets
      display: flex
      align-items: center
      gap: var(--space-2xs)

  &__stage
    +content-column(44rem)
    position: relative
    z-index: 1
    flex: 1 1 auto
    display: flex
    // The deck sits a little above centre: cards grow downwards as answers and
    // verdicts appear, and a run should not slide up the screen as it goes.
    align-items: flex-start
    justify-content: center
    padding-block: var(--space-2xs) var(--space-2xl)

    &__inner
      width: 100%
</style>
