<template>
  <div class="noo-sidebar-skeleton">
    <div
      class="noo-sidebar-skeleton__loader noo-sidebar-skeleton__loader--small"
    />
    <div
      class="noo-sidebar-skeleton__loader noo-sidebar-skeleton__loader--small"
    />
    <div class="noo-sidebar-skeleton__loader" />
    <div
      class="noo-sidebar-skeleton__loader noo-sidebar-skeleton__loader--medium"
    />
    <div
      class="noo-sidebar-skeleton__loader noo-sidebar-skeleton__loader--small"
    />
    <div
      class="noo-sidebar-skeleton__loader noo-sidebar-skeleton__loader--large"
    />
  </div>
</template>

<style lang="sass" scoped>
.noo-sidebar-skeleton
  display: flex
  flex-direction: column
  gap: 12px

  &__loader
    width: 100%
    height: 40px
    background: var(--skeleton-bg)
    animation: var(--skeleton-animation)
    border-radius: var(--border-radius)

    &--small
      height: 20px
      width: 60%

    &--medium
      height: 50px
      width: 80%

    &--large
      height: 120px
</style>
