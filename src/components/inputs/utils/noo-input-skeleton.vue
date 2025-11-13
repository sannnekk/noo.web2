<template>
  <div class="noo-input-skeleton">
    <div class="noo-input-skeleton__label" />
    <div class="noo-input-skeleton__input" />
  </div>
</template>

<style scoped lang="sass">
.noo-input-skeleton
  display: flex
  flex-direction: column
  gap: 8px

  &__label
    width: 30%
    height: 12px
    background: var(--skeleton-bg)
    animation: var(--skeleton-animation)
    border-radius: var(--border-radius)

  &__input
    width: 100%
    height: 2.4em
    background: var(--skeleton-bg)
    animation: var(--skeleton-animation)
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
</style>
