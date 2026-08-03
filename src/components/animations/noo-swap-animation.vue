<template>
  <!--
    For swapping one state of a block for another — loading -> content -> error.
    Unlike noo-if-animation, the outgoing branch leaves before the incoming one
    enters, so the two never overlap and the block doesn't jump while both are
    in the DOM.
  -->
  <transition
    appear
    name="swap-transition"
    mode="out-in"
  >
    <slot />
  </transition>
</template>

<style lang="sass">
// Not scoped: the transition classes land on the slotted element, which
// belongs to the parent component.
.swap-transition
  &-enter-active,
  &-leave-active
    transition: opacity 0.2s ease, transform 0.2s ease

  &-enter-from
    opacity: 0
    transform: translateY(0.75rem)

  &-leave-to
    opacity: 0
    transform: translateY(-0.75rem)

  +reduced-motion
    &-enter-active,
    &-leave-active
      transition: none

    &-enter-from,
    &-leave-to
      transform: none
</style>
