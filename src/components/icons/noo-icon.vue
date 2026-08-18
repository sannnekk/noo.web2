<template>
  <component
    :is="icon"
    class="icon"
    :class="{ animation }"
    :hoverable="hoverable"
  />
</template>

<script setup lang="ts">
import { shallowRef, watch, type Component } from 'vue'

export type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'bars'
  | 'home'
  | 'uni-cap'
  | 'list'
  | 'calendar'
  | 'user'
  | 'users'
  | 'student'
  | 'logout'
  | 'check-green'
  | 'check-red'
  | 'cross-red'
  | 'question'
  | 'attention-yellow'
  | 'minus-yellow'
  | 'jpg-file'
  | 'png-file'
  | 'pdf-file'
  | 'telegram'
  | 'telegram-blue'
  | 'info'
  | 'delete'
  | 'moon'
  | 'sun'
  | 'search'
  | 'more'
  | 'edit'
  | 'copy'
  | 'add'
  | 'keyboard'
  | 'change-user'
  | 'eye'
  | 'poll'
  | 'google-sheets'
  | 'settings'
  | 'danger'
  | 'subject'
  | 'help'
  | 'notifications'
  | 'heart'
  | 'welcome'
  | 'question'
  | 'brush'
  | 'star'
  | 'nootube'
  | 'play'
  | 'statistics'
  | 'table'
  | 'close'
  | 'drag-handle'
  | 'clock'
  | 'payment'
  | 'pin'
  | 'cards'
  | 'archive'
  | 'yandex'
  | 'vk'

interface Props {
  name: IconName
  animation?: boolean
  hoverable?: boolean
}

const props = defineProps<Props>()

const icon = shallowRef<Component | string>('div')

/**
 * Icons are code-split, so every name means another async import. Reusing an
 * icon instance under a new name (a list item whose state changed, for example)
 * must swap the drawing too, and the counter keeps a slow earlier import from
 * landing on top of a later one.
 */
let pendingRequest = 0

watch(
  () => props.name,
  (name) => {
    const request = ++pendingRequest

    import(`./noo-icons/${name}-icon.vue`)
      .then((module) => {
        if (request === pendingRequest) {
          icon.value = module.default
        }
      })
      .catch(() => {
        if (request === pendingRequest) {
          icon.value = 'div'
        }
      })
  },
  { immediate: true }
)
</script>

<style lang="sass" scoped>
.icon
  height: 1em
  width: 1em
  transition: all 0.1s ease-in-out

  &:deep()
    .moveable-forwards,
    .moveable-backwards
      transition: all 0.1s ease-in-out

  &.animation:deep()
    .moveable-forwards
      transform-origin: center
      transform: scale(0.9) translate(7%, 7%)
    .moveable-backwards
      transform-origin: center
      transform: scale(0.9) translate(-7%, -7%)
</style>
