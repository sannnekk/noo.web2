<template>
  <transition-group
    name="list"
    :tag="tag"
    class="list"
  >
    <slot />
  </transition-group>
</template>

<script setup lang="ts">
interface Props {
  tag?: string
}

withDefaults(defineProps<Props>(), {
  tag: 'div'
})
</script>

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
