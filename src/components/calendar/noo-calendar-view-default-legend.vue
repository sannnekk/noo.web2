<template>
  <div class="noo-calendar-view-default-legend">
    <div class="noo-calendar-view-default-legend__items">
      <div
        v-for="item in items"
        :key="item.label"
        class="noo-calendar-view-default-legend__items__item"
      >
        <div class="noo-calendar-view-default-legend__items__item__color">
          <noo-color-badge :color="item.color" />
        </div>
        <div class="noo-calendar-view-default-legend__items__item__definition">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEventType } from '@/modules/calendar/api/calendar.types'
import { getEventColor, getEventTypeLabel } from './calendar-helpers'

const eventTypes: CalendarEventType[] = [
  'assigned-work-solve-deadline',
  'assigned-work-check-deadline',
  'assigned-work-checked',
  'assigned-work-solved',
  'custom'
]

const items: {
  label: string
  color: string
}[] = eventTypes.map((type) => ({
  label: getEventTypeLabel(type),
  color: getEventColor(type)
}))
</script>

<style scoped lang="sass">
.noo-calendar-view-default-legend
  padding: 1em 0

  &__items
    display: flex
    flex-direction: column

    &__item
      display: flex
      align-items: center
      gap: 0.5em

      &__color
        font-size: 1.2em

      &__definition
        font-size: 0.9em
        color: var(--text-light)
</style>
