<template>
  <div class="calendar">
    <datepicker
      :inline="true"
      :monday-first="true"
      :value="modelValue"
      :day-cell-content="getCellContent"
      @changed-month="emits('changed-month', $event)"
      @changed-year="emits('changed-year', $event)"
      @selected="emits('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import Datepicker from 'vuejs3-datepicker'

/**
 * Props
 */
interface Props {
  modelValue: Date
  dayFunction?: (date: Date) => string[]
}

const props = defineProps<Props>()

const emits = defineEmits<Emits>()

/**
 * Object to emit the event and update the modelValue
 */
interface Emits {
  (e: 'update:modelValue', value: Date): void
  (e: 'changed-month', value: Date): void
  (e: 'changed-year', value: Date): void
}

function getCellContent({
  date,
  timestamp
}: {
  date: number
  timestamp: number
}) {
  const dateObj = new Date(timestamp)

  // check if it is today
  if (
    dateObj.getDate() === new Date().getDate() &&
    dateObj.getMonth() === new Date().getMonth() &&
    dateObj.getFullYear() === new Date().getFullYear()
  ) {
    date = `<b>${date}</b>` as any
  }

  if (!props.dayFunction) {return `<span class="date">${date}</span>`}

  const colors = props.dayFunction(dateObj)

  return (
    `<span class="date">${date}</span><span class='tags'>` +
    colors
      .map((color) => {
        return `<span class="tag" style="background:${color}"></span>`
      })
      .join('') +
    `</span>`
  )
}
</script>

<style scoped lang="sass">

.calendar:deep()
  .vuejs3-datepicker
    color: var(--form-text-color)

    &__calendar
      background-color: var(--light)

    &__calendar-topbar
      background: var(--primary)

    &__calendar-actionarea > div
      margin-top: 2.5em

    &__calendar-topbar-year,
    &__calendar-topbar-day
      color: var(--dark)

    &__calendar
      .cell
        border-radius: var(--border-radius)

        &.day
          display: inline-flex
          flex-direction: column
          align-items: center
          justify-content: center

          .date
            line-height: 1.5

          .tags
            display: flex
            .tag
              display: block
              width: 0.4em
              height: 0.4em
              border-radius: 40px
              margin: 0 0.1em


        &:not(.blank):not(.disabled)
          &.day:hover,
          &.month:hover,
          &.year:hover
            border: 1px solid var(--border-color) !important

        &.selected
          background: var(--primary)
          color: var(--dark)
</style>
