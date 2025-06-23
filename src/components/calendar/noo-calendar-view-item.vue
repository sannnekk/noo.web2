<template>
  <div
    v-if="event"
    class="noo-calendar-view-item"
    :class="classes.join(' ')"
    :style="{
      top: topOffset
    }"
  >
    <div
      class="noo-calendar-view-item__inner"
      :class="{
        'noo-calendar-view-item__inner--is-hover': classes.includes('is-hover')
      }"
      :style="{ borderLeftColor: color }"
      @mouseenter="$emit('hover', true)"
      @mouseleave="$emit('hover', false)"
      @click="$emit('click', id)"
    >
      <noo-text-block class="noo-calendar-view-item__inner__title">
        {{ title }}
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEventEntity } from '@/modules/calendar/api/calendar.types'
import { computed } from 'vue'
import type { INormalizedCalendarItem } from 'vue-simple-calendar'

interface Props extends INormalizedCalendarItem {
  event?: CalendarEventEntity
  topOffset: string
  color?: string
}

interface Emits {
  (e: 'hover', isHover: boolean): void
  (e: 'click', id: string): void
}

const props = defineProps<Props>()

defineEmits<Emits>()

const color = computed(() => {
  switch (props.event?.type) {
    case 'assigned-work-check-deadline':
      return 'var(--lila)'
    case 'assigned-work-checked':
      return 'var(--success)'
    case 'assigned-work-solve-deadline':
      return 'var(--danger)'
    case 'assigned-work-solved':
      return 'var(--warning)'
    case 'custom':
    default:
      return 'var(--text-light)'
  }
})
</script>

<style scoped lang="sass">
.noo-calendar-view-item
  position: absolute
  padding: 0.1em 0.3em 0.1em 0.3em

  &.offset0
    left: 0

  &.offset1
    left: calc( 100% / 7 )

  &.offset2
    left: calc( 100% / 7 * 2 )

  &.offset3
    left: calc( 100% / 7 * 3 )

  &.offset4
    left: calc( 100% / 7 * 4 )

  &.offset5
    left: calc( 100% / 7 * 5 )

  &.offset6
    left: calc( 100% / 7 * 6 )

  &.span1
    width: calc( 100% / 7 )

  &.span2
    width: calc( 100% / 7 * 2 )

  &.span3
    width: calc( 100% / 7 * 3 )

  &.span4
    width: calc( 100% / 7 * 4 )

  &.span5
    width: calc( 100% / 7 * 5 )

  &.span6
    width: calc( 100% / 7 * 6 )

  &.span7
    width: calc( 100% / 7 * 7 )

  &.toBeContinued
    padding-right: 0

    .noo-calendar-view-item__inner
      border-top-right-radius: 0
      border-bottom-right-radius: 0

  &.continued
    padding-left: 0

    .noo-calendar-view-item__inner
      border-left: 0
      border-top-left-radius: 0
      border-bottom-left-radius: 0

  &__inner
    padding: 0.3em 0.4em 0.3em 0.2em
    border-left: 8px solid var(--border-color)
    border-radius: var(--border-radius)
    cursor: pointer
    background-color: var(--lightest)
    box-shadow: var(--block-shadow)

    p
      white-space: nowrap
      text-overflow: ellipsis
      overflow: hidden
      max-width: 100%

    &--is-hover
      background-color: var(--light-background-color)

    &__title
      padding: 0
      margin: 0
</style>
