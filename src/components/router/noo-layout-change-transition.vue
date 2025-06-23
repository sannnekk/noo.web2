<template>
  <Transition
    name="layout-change-transition"
    mode="out-in"
    @before-leave="onBeforeLeave()"
    @after-enter="onAfterEnter()"
  >
    <slot />
  </Transition>
</template>

<script lang="ts" setup>
function onBeforeLeave() {
  // disable scroll on body
  document.body.style.overflow = 'hidden'
}

function onAfterEnter() {
  // enable scroll on body
  document.body.style.overflow = ''
}
</script>

<style lang="sass">
.layout-change-transition
  &-move,
  &-enter-active,
  &-leave-active
    transition: all 0.3s ease

  &-enter-from,
  &-leave-to
    opacity: 0
    transform: scale(1.1)
</style>
