<template>
  <component
    :is="icon"
    class="icon"
    :class="{ animation }"
  />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'

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
  | 'question-yellow'
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

interface Props {
  name: IconName
  animation?: boolean
}

const props = defineProps<Props>()

let icon = shallowRef('div')

import(`./noo-icons/${props.name}-icon.vue`)
  .then((module) => {
    icon.value = module.default
  })
  .catch(() => {
    icon.value = 'div'
  })
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
