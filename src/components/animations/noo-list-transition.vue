<template>
  <transition-group
    name="list"
    tag="div"
    class="list"
  >
    <slot />
  </transition-group>
</template>

<style lang="sass" scoped>
:deep()
  .list
    &-move,
    &-enter-active,
    &-leave-active
      transition: all 0.3s ease

    &-enter-from,
    &-leave-to
      opacity: 0
      transform: scale(0.9)

    &-leave-active
      position: absolute
</style>
