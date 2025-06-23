<template>
  <div
    class="noo-scrollable-block"
    :class="{
      'noo-scrollable-block--dark': theme.mode.value === 'dark',
      'noo-scrollable-block--scrollable-top': scrollableToTop,
      'noo-scrollable-block--scrollable-bottom': scrollableToBottom
    }"
  >
    <div
      ref="scrollable-block"
      class="noo-scrollable-block__inner"
      :style="{ maxHeight }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementScrollbar } from '@/core/composables/useElementScrollbar';
import { useTheme } from '@/core/composables/useTheme';
import { useTemplateRef } from 'vue';

interface Props {
  maxHeight: string
}

defineProps<Props>()
defineOptions({
  inheritAttrs: true
})

const gridRef = useTemplateRef<HTMLDivElement>('scrollable-block')

const { scrollableToTop, scrollableToBottom } = useElementScrollbar(gridRef)

const theme = useTheme()
</script>

<style lang="sass" scoped>
.noo-scrollable-block
  position: relative

  &__inner
    overflow-y: auto

  &--scrollable-top
    &::before
      opacity: 1 !important

  &--scrollable-bottom
    &::after
      opacity: 1 !important

  // inline shadow bottom to show that there are more items
  &::after
    content: ''
    display: block
    opacity: 0
    transition: opacity 0.1s ease-in-out
    position: absolute
    bottom: 0
    width: 100%
    height: 1em
    pointer-events: none
    background-image: linear-gradient(to bottom, transparent, #dddddd99)

  &::before
    content: ''
    display: block
    opacity: 0
    transition: opacity 0.1s ease-in-out
    position: absolute
    top: 0
    width: 100%
    height: 1em
    pointer-events: none
    background-image: linear-gradient(to top, transparent, #dddddd99)

  &--dark
    &::after
      background-image: linear-gradient(to bottom, transparent, #00000055)

    &::before
      background-image: linear-gradient(to top, transparent, #00000055)
</style>
