<template>
  <div class="noo-support-logo">
    <div class="noo-support-logo__img">
      <noo-round-logo />
    </div>
    <div class="noo-support-logo__title">
      <h1>
        <b>НОО.</b>
        <span>Помощь и поддержка</span>
      </h1>
    </div>
  </div>
</template>

<style scoped lang="sass">
.noo-support-logo
  display: flex
  align-items: center
  gap: var(--space-2xs)
  min-width: 0

  +tablet-down
    justify-content: center
    text-align: center

  &__img
    flex-shrink: 0
    // A fixed 7em disc took a third of a phone's width; fluid() shrinks it with
    // the viewport the way the rest of the app's imagery does.
    width: fluid(3rem, 7rem)
    height: fluid(3rem, 7rem)

  &__title
    min-width: 0

    // Kept on one line where there is room for it, and allowed to wrap rather
    // than overflow once there is not.
    +up(md)
      white-space: nowrap

    h1
      margin: 0
      font-size: fluid(1.1rem, 2rem)
      line-height: 1.2

      span
        font-weight: normal
</style>
