import type { CalendarEventType } from '@/modules/calendar/api/calendar.types'
import { DateHelpers } from '@/core/utils/dates'

/**
 * The colour used to represent an event type across the calendar (dots on the
 * day cells, the legend, and the event cards). Kept in one place so the legend
 * and the markers never drift apart.
 */
function getEventColor(eventType: CalendarEventType): string {
  switch (eventType) {
    case 'assigned-work-check-deadline':
      return 'var(--lila)'
    case 'assigned-work-solve-deadline':
      return 'var(--danger)'
    case 'assigned-work-checked':
      return 'var(--success)'
    case 'assigned-work-solved':
      return 'var(--warning)'
    case 'custom':
    default:
      return 'var(--text-light)'
  }
}

/** Human-readable Russian label for an event type. */
function getEventTypeLabel(eventType: CalendarEventType): string {
  switch (eventType) {
    case 'assigned-work-check-deadline':
      return 'Дедлайн проверки работы'
    case 'assigned-work-solve-deadline':
      return 'Дедлайн сдачи работы'
    case 'assigned-work-checked':
      return 'Работа проверена'
    case 'assigned-work-solved':
      return 'Работа сдана'
    case 'custom':
    default:
      return 'Другое событие'
  }
}

/**
 * A stable per-day key (`YYYY-M-D`) for an instant, computed in Moscow time so
 * events group onto the same calendar cell the rest of the app shows them on.
 */
function getMoscowDayKey(value: Date): string {
  const { year, month, day } = DateHelpers.toMoscowParts(value)

  return `${String(year)}-${String(month)}-${String(day)}`
}

/**
 * A naive local `Date` whose local Y/M/D equals the Moscow wall-clock day of
 * the given instant. The datepicker matches markers and cells by their local
 * date parts, so this lines a marker up with the correct cell.
 */
function toLocalDayDate(value: Date): Date {
  const { year, month, day } = DateHelpers.toMoscowParts(value)

  return new Date(year, month - 1, day)
}

/** The `YYYY-M-D` key for a plain local `Date` (a calendar cell). */
function getLocalDayKey(date: Date): string {
  return `${String(date.getFullYear())}-${String(
    date.getMonth() + 1
  )}-${String(date.getDate())}`
}

export {
  getEventColor,
  getEventTypeLabel,
  getMoscowDayKey,
  toLocalDayDate,
  getLocalDayKey
}
