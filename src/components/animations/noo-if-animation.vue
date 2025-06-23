<template>
  <transition
    appear
    name="if-transition"
    :duration="300"
  >
    <slot />
  </transition>
</template>

<style lang="sass">
.if-transition
  &-enter-active,
  &-leave-active
    transition: all 0.3s ease
    overflow: hidden

  &-enter-from,
  &-leave-to
    opacity: 0
    transform: scale(0.95)
    max-height: 0

  &-enter-to,
  &-leave-from
    opacity: 1
    transform: scale(1)
    max-height: 100vh
</style>
