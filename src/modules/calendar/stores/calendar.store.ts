import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { computed, shallowRef, type ComputedRef } from 'vue'
import type { CalendarEventEntity } from '../api/calendar.types'
import { calendarEvents } from '../mock-data/calendar-events'

export interface CalendarStore {
  /**
   * Sets the user ID for which the calendar events will be fetched.
   *
   * @param userId If not provided, the current user's ID will be used.
   */
  setUserId: (userId?: string) => void
  /**
   * Indicates if the calendar is read-only for the current user.
   * If true, the user cannot modify events or create new ones.
   */
  isReadOnly: ComputedRef<boolean>
  /**
   * Fetches calendar events for the specified year and month.
   *
   * @param payload Contains the year and month for which to fetch events.
   */
  calendar: UseApiRequestReturn<
    {
      year: number
      month: number
    },
    CalendarEventEntity[]
  >
}

export const useCalendarStore = defineStore(
  'calendar:calendar',
  (): CalendarStore => {
    const authStore = useAuthStore()
    const uiStore = useGlobalUIStore()
    const userId = shallowRef<string>('')

    function setUserId(newUserId?: string) {
      if (!newUserId) {
        userId.value = authStore.userInfo!.id
      } else {
        userId.value = newUserId
      }
    }

    const isReadOnly = computed(() => {
      return authStore.userInfo?.id !== userId.value
    })

    const calendar = useApiRequest<
      {
        year: number
        month: number
      },
      CalendarEventEntity[]
    >(
      (payload) => {
        uiStore.setLoading(true)

        return {
          data: calendarEvents
        }

        /* return CalendarService.getEvents(
          payload.year,
          payload.month,
          userId.value
        ) */
      },
      () => { uiStore.setLoading(false); },
      (error) => {
        uiStore.setLoading(false)
        uiStore.createApiErrorToast(
          'Не удалось загрузить события календаря',
          error
        )
      }
    )

    return {
      isReadOnly,
      setUserId,
      calendar
    }
  }
)
