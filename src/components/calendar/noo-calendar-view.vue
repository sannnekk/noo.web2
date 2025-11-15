<template>
  <calendar-view
    class="noo-calendar-view"
    locale="ru-RU"
    :enable-date-selection="props.readonly"
    :starting-day-of-week="1"
    :items="calendarItems"
    :show-date="currentDate"
  >
    <template #header="{ headerProps }">
      <div class="noo-calendar-view__header">
        <div class="noo-calendar-view__header__title-slot">
          <slot name="header-title" />
        </div>
        <div class="noo-calendar-view__header__month-title">
          <noo-title :size="3">
            {{ headerProps.periodLabel }}
          </noo-title>
        </div>
        <div class="noo-calendar-view__header__actions">
          <noo-button
            variant="secondary"
            class="noo-calendar-view__header__actions calendar-view__header__actions--prev"
            @click="changePeriod(headerProps.previousPeriod)"
          >
            <noo-icon name="arrow-left" />
          </noo-button>
          <noo-button
            variant="secondary"
            class="noo-calendar-view__header__actions calendar-view__header__actions--next"
            @click="changePeriod(headerProps.nextPeriod)"
          >
            <noo-icon name="arrow-right" />
          </noo-button>
        </div>
      </div>
    </template>
    <template #item="{ value, top }">
      <noo-calendar-view-item
        v-bind="value"
        :top-offset="top"
        :event="getEventById(value.id)"
        @hover="onItemHover(value.id, $event)"
        @click="onItemClick($event)"
      />
    </template>
  </calendar-view>
  <div class="noo-calendar-view__legend">
    <slot name="legend">
      <noo-calendar-view-default-legend />
    </slot>
  </div>
  <noo-calendar-item-modal
    v-model:is-open="itemModal.isOpen"
    :event="itemModal.item"
    @save="onItemSaved()"
  />
</template>

<script setup lang="ts">
import type { CalendarEventEntity } from '@/modules/calendar/api/calendar.types'
import { computed, reactive, shallowRef, watch } from 'vue'
import { CalendarView, type ICalendarItem } from 'vue-simple-calendar'
import 'vue-simple-calendar/dist/vue-simple-calendar.css'

interface Props {
  readonly?: boolean
  events: CalendarEventEntity[]
  isLoading?: boolean
}

interface Emits {
  (e: 'item-saved', event: CalendarEventEntity): void
  (e: 'change-period', period: Date | null): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const currentDate = shallowRef(new Date())
const itemModal = reactive<{
  item: CalendarEventEntity | null
  isOpen: boolean
}>({
  item: null,
  isOpen: false
})

const items = shallowRef<(CalendarEventEntity & { classes?: string[] })[]>(
  props.events
)

watch(
  () => props.events,
  (newEvents) => (items.value = newEvents),
  { immediate: true }
)

const calendarItems = computed<ICalendarItem[]>(() => {
  return items.value.map((event) => ({
    ...event,
    startDate: new Date(event.startDateTime),
    endDate: event.endDateTime ? new Date(event.endDateTime) : undefined
  }))
})

function changePeriod(period: Date | null): void {
  if (period) {
    currentDate.value = period
    emits('change-period', period)
  }
}

function onItemHover(id: string, isHover: boolean): void {
  items.value = items.value.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        classes: isHover
          ? [...(item.classes ?? []), 'is-hover']
          : (item.classes ?? []).filter((c) => c !== 'is-hover')
      }
    }

    return item
  })
}

function onItemClick(eventId: string): void {
  itemModal.item = items.value.find((item) => item.id === eventId) ?? null

  if (itemModal.item) {
    itemModal.isOpen = true
  }
}

function onItemSaved(): void {
  if (itemModal.item) {
    emits('item-saved', itemModal.item)
  }
  itemModal.isOpen = false
}

function getEventById(id: string): CalendarEventEntity | undefined {
  return items.value.find((item) => item.id === id)
}
</script>

<style scoped lang="sass">
.noo-calendar-view
  min-height: 800px

  &__header
    display: flex
    flex-direction: row
    justify-content: flex-start
    align-items: center
    gap: 1em

    &__month-title
      text-transform: capitalize

    &__actions
      display: flex
      gap: 1em
      align-items: center

      &--prev,
      &--next
        &:hover
          svg
            --form-text-color: var(--white) !important

  // styles inside the calendar component
  &:deep()
    .cv-header-days, .cv-header-day, .cv-weeks, .cv-week, .cv-day, .cv-item
      border-style: solid
      border-color: var(--border-color)

    .cv-day
      &.outsideOfMonth
        background-color: var(--light-background-color)

        .cv-day-number
          color: var(--text-light)

      &.today
        background-color: var(--primary)

    .cv-header-days
      border: none

      .cv-header-day
        border: none
        padding: 0.75em 0
        color: var(--text-light)
        text-transform: uppercase
</style>
