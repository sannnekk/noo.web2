<template>
  <div
    class="noo-calendar-event-card"
    :style="{ borderLeftColor: color }"
  >
    <div class="noo-calendar-event-card__header">
      <noo-color-badge :color="color" />
      <noo-title
        :size="4"
        no-margin
      >
        {{ event.title || getEventTypeLabel(event.type) }}
      </noo-title>
    </div>

    <noo-text-block
      size="small"
      dimmed
      no-margin
      class="noo-calendar-event-card__type"
    >
      {{ getEventTypeLabel(event.type) }}
    </noo-text-block>

    <div class="noo-calendar-event-card__meta">
      <noo-text-block
        size="small"
        no-margin
      >
        <noo-date
          :value="event.startDateTime"
          include-time
          timezones="both"
        />
      </noo-text-block>
      <noo-text-block
        v-if="event.endDateTime"
        size="small"
        dimmed
        no-margin
      >
        Длительность:
        <noo-duration
          :from="event.startDateTime"
          :to="event.endDateTime"
        />
      </noo-text-block>
    </div>

    <noo-text-block
      v-if="event.description"
      size="small"
      no-margin
      class="noo-calendar-event-card__description"
    >
      {{ event.description }}
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEventEntity } from '@/modules/calendar/api/calendar.types'
import { computed } from 'vue'
import { getEventColor, getEventTypeLabel } from './calendar-helpers'

interface Props {
  event: CalendarEventEntity
}

const props = defineProps<Props>()

const color = computed(() => getEventColor(props.event.type))
</script>

<style scoped lang="sass">
.noo-calendar-event-card
  padding: 0.8em 1em
  border-radius: var(--border-radius)
  border-left: 6px solid var(--border-color)
  background-color: var(--lightest)
  box-shadow: var(--block-shadow)

  &__header
    display: flex
    align-items: center
    gap: 0.5em

  &__type
    margin-top: 0.1em

  &__meta
    margin-top: 0.5em
    display: flex
    flex-direction: column
    gap: 0.1em

  &__description
    margin-top: 0.6em
    white-space: pre-line
</style>
