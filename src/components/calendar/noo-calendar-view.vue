<template>
  <div class="noo-calendar-view">
    <div
      v-if="errorInfo && !isLoading"
      class="noo-calendar-view__error"
    >
      <noo-error-block
        with-image
        centered
        :try-again="reload"
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
            errorInfo?.description ||
            'Попробуйте обновить страницу или зайти позже.'
          }}
        </noo-text-block>
      </noo-error-block>
    </div>
    <noo-sidebar-layout v-else>
      <template #sidebar>
        <div class="noo-calendar-view__calendar">
          <vue-date-picker
            v-model="selectedDate"
            inline
            auto-apply
            :time-config="{ enableTimePicker: false }"
            :week-start="1"
            :locale="locale"
            :markers="markers"
            @update-month-year="onMonthYearChange"
          >
            <template #marker="{ date }">
              <div class="noo-calendar-view__calendar__dots">
                <span
                  v-for="(dotColor, index) in dotsForDay(date)"
                  :key="index"
                  class="noo-calendar-view__calendar__dots__dot"
                  :style="{ backgroundColor: dotColor }"
                />
              </div>
            </template>
          </vue-date-picker>
        </div>
        <div class="noo-calendar-view__legend">
          <noo-calendar-view-default-legend />
        </div>
      </template>
      <template #content>
        <div class="noo-calendar-view__events">
          <noo-title :size="3">
            События
            <span class="noo-calendar-view__events__date">
              <noo-date
                :value="selectedDate"
                timezones="Europe/Moscow"
              />
            </span>
          </noo-title>
          <div
            v-if="isLoading"
            class="noo-calendar-view__events__loading"
          >
            <noo-loader-icon />
          </div>
          <div
            v-else-if="eventsForSelectedDay.length"
            class="noo-calendar-view__events__list"
          >
            <noo-calendar-event-card
              v-for="event in eventsForSelectedDay"
              :key="event.id"
              :event="event"
            />
          </div>
          <noo-text-block
            v-else
            dimmed
            class="noo-calendar-view__events__empty"
          >
            На этот день событий нет.
          </noo-text-block>
        </div>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEventEntity } from '@/modules/calendar/api/calendar.types'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { CalendarService } from '@/modules/calendar/api/calendar.service'
import { ruLocale } from '@/core/utils/dates.ru-locale'
import { VueDatePicker, type Marker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, ref, watch } from 'vue'
import {
  getEventColor,
  getLocalDayKey,
  getMoscowDayKey,
  toLocalDayDate
} from './calendar-helpers'

interface Props {
  /** Whose calendar to show. Defaults to the authenticated user. */
  userId?: string
}

const props = defineProps<Props>()

const authStore = useAuthStore()

// `date-fns` is not a direct dependency, so borrow the picker's own `locale`
// prop type and feed it our Intl-built Russian locale.
type DatePickerLocale = InstanceType<typeof VueDatePicker>['$props']['locale']
const locale = ruLocale as unknown as DatePickerLocale

const resolvedUserId = computed(() => props.userId ?? authStore.userId ?? '')

/** The day the user has selected; also drives the events list. */
const selectedDate = ref(new Date())
// The month/year currently shown in the calendar — it can differ from
// `selectedDate` while the user pages through months without picking a day.
const viewedYear = ref(selectedDate.value.getFullYear())
const viewedMonth = ref(selectedDate.value.getMonth()) // 0-based

const eventsRequest = useApiRequest<
  { year: number; month: number },
  CalendarEventEntity[]
>(({ year, month }) =>
  CalendarService.getEvents(year, month, resolvedUserId.value)
)

const isLoading = computed(() => eventsRequest.isLoading.value)
const errorInfo = computed(() => eventsRequest.error.value)
const eventList = computed(() => eventsRequest.data.value ?? [])

function reload(): void {
  // `getEvents` expects a 1-based month.
  void eventsRequest.execute({
    year: viewedYear.value,
    month: viewedMonth.value + 1
  })
}

reload()
watch(resolvedUserId, reload)

/** Events grouped by the calendar cell (Moscow day) they belong to. */
const eventsByDay = computed(() => {
  const map = new Map<string, CalendarEventEntity[]>()

  for (const event of eventList.value) {
    const key = getMoscowDayKey(event.startDateTime)
    const bucket = map.get(key)

    if (bucket) {
      bucket.push(event)
    } else {
      map.set(key, [event])
    }
  }

  return map
})

/** One marker per day that has at least one event. */
const markers = computed<Marker[]>(() =>
  [...eventsByDay.value.values()].map((events) => ({
    date: toLocalDayDate(events[0].startDateTime),
    type: 'dot'
  }))
)

/** Distinct event-type colours for a given calendar cell. */
function dotsForDay(date: Date): string[] {
  const events = eventsByDay.value.get(getLocalDayKey(date)) ?? []
  const colors: string[] = []

  for (const event of events) {
    const color = getEventColor(event.type)

    if (!colors.includes(color)) {
      colors.push(color)
    }
  }

  return colors
}

const eventsForSelectedDay = computed(() => {
  const events = eventsByDay.value.get(getLocalDayKey(selectedDate.value)) ?? []

  return [...events].sort(
    (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
  )
})

function onMonthYearChange({
  month,
  year
}: {
  month: number
  year: number
}): void {
  viewedMonth.value = month
  viewedYear.value = year
  reload()
}
</script>

<style scoped lang="sass">
.noo-calendar-view
  &__error
    width: min(600px, 90%)
    margin: 0 auto
    padding: 3em 0

  &__calendar
    // Bump the day-cell size up from the 35px default.
    --dp-cell-size: 2.8em

    // v13 ships double-dash class names (`.dp--*`). The widget defaults to a
    // 260px min-width; stretch the whole inline wrapper chain so it fills the
    // sidebar instead of staying at its intrinsic width.
    :deep(.dp--main),
    :deep(.dp--outer-menu-wrap),
    :deep(.dp--menu-wrapper)
      width: 100%

    :deep(.dp--menu)
      width: 100%
      min-width: 0
      border: none

    &__dots
      display: flex
      justify-content: center
      gap: 2px
      position: absolute
      bottom: 2px
      left: 0
      right: 0

      &__dot
        width: 5px
        height: 5px
        border-radius: 50%

  &__events
    margin-top: 1em

    &__date
      font-size: 0.7em
      color: var(--text-light)
      margin-left: 0.5em

    &__list
      display: flex
      flex-direction: column
      gap: 0.8em
      margin-top: 0.5em

    &__loading
      display: flex
      justify-content: center
      padding: 2em 0
      font-size: 2em

    &__empty
      margin-top: 0.5em
</style>
