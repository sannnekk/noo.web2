import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { UnsavedEntity } from '@/core/utils/types.utils'
import type { CalendarEventEntity } from './calendar.types'

const BASE_PATH = '/calendar'

interface ICalendarService {
  /**
   * Fetches a list of calendar events for the current user or a specific user.
   * @param userId The ID of the user to get calendar events for. If not provided, the current user will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of CalendarEventEntity objects.
   */
  getEvents(
    year: number,
    month: number,
    userId?: string
  ): Promise<ApiResponse<CalendarEventEntity[]>>
  /**
   * Create a new calendar event.
   *
   * @param event The calendar event to be created.
   * @returns A promise that resolves to an ApiResponse containing the created CalendarEventEntity.
   */
  createEvent(
    event: UnsavedEntity<CalendarEventEntity>
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Delete a calendar event.
   *
   * @param id The ID of the calendar event to be deleted.
   */
  delete(id: string): Promise<ApiResponse>
}

async function getEvents(
  year: number,
  month: number,
  userId: string
): Promise<ApiResponse<CalendarEventEntity[]>> {
  return await Api.get(`${BASE_PATH}/${userId}/${String(year)}/${String(month)}`)
}

async function createEvent(
  event: UnsavedEntity<CalendarEventEntity>
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, event)
}

async function deleteCalendarEvent(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const CalendarService: ICalendarService = {
  getEvents,
  createEvent,
  delete: deleteCalendarEvent
}
