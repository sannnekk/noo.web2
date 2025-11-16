<template>
  <div class="calendar-page">
    <div
      v-if="calendarStore.calendar.data"
      class="calendar-page__view"
    >
      <noo-calendar-view
        :readonly="calendarStore.isReadOnly"
        :events="calendarStore.calendar.data"
        :is-loading="calendarStore.calendar.isLoading"
        @change-period="onPeriodChange($event)"
      />
    </div>
    <div
      v-else
      class="calendar-page__error"
    >
      <noo-error-block
        with-image
        :try-again="fetchEvents"
      >
        <noo-title
          :size="3"
          align="center"
        >
          Не удалось загрузить события календаря
        </noo-title>
        <noo-text-block
          dimmed
          align="center"
        >
          {{
            calendarStore.calendar.error?.description ||
            'Попробуйте обновить страницу или зайти позже.'
          }}
        </noo-text-block>
      </noo-error-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalendarStore } from '../stores/calendar.store'

interface Props {
  userId?: string
}

const props = defineProps<Props>()
const calendarStore = useCalendarStore()

calendarStore.setUserId(props.userId)

function fetchEvents(): void {
  calendarStore.calendar.execute({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })
}

fetchEvents()

function onPeriodChange(newPeriod: Date | null): void {
  if (newPeriod) {
    calendarStore.calendar.execute({
      year: newPeriod.getFullYear(),
      month: newPeriod.getMonth() + 1
    })
  }
}
</script>

<style lang="sass" scoped>
.calendar-page
  &__error
    width: min(600px, 90%)
    margin: 0 auto
    padding: 3em 0
</style>
