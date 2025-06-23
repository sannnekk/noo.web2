import {
  formatDistance as _formatDistance,
  formatDuration as _formatDuration,
  addDays as _addDays,
  format,
  intervalToDuration,
  type Duration,
  type FormatDistanceOptions,
  type FormatDurationOptions,
  type FormatOptions,
  type Locale
} from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'

export interface Timezone {
  /**
   * The timezone to use for formatting.
   * If not provided, the local timezone will be used.
   */
  timezone?: 'UTC' | 'Europe/Moscow' | 'local'
}

const locale: Locale = ru

function formatDistance(
  date: Date | string | undefined | null,
  options?: FormatDistanceOptions & Timezone
): string {
  if (!date) {
    return '-'
  }

  let tzDate: Date = new Date(date)

  switch (options?.timezone) {
    case 'UTC':
      break
    case 'Europe/Moscow':
      tzDate = toZonedTime(new Date(date), 'Europe/Moscow')
      break
    case 'local':
      tzDate = toZonedTime(
        new Date(date),
        Intl.DateTimeFormat().resolvedOptions().timeZone
      )
      break
    default:
      break
  }

  return _formatDistance(tzDate, new Date(), {
    addSuffix: true,
    locale,
    ...options
  })
}

function formatDate(
  date: Date | string | undefined | null,
  options?: FormatOptions & Timezone & { includeTime?: boolean }
): string {
  if (!date) {
    return '-'
  }

  let tzDate: Date = new Date(date)

  switch (options?.timezone) {
    case 'UTC':
      break
    case 'Europe/Moscow':
      tzDate = toZonedTime(new Date(date), 'Europe/Moscow')
      break
    case 'local':
      tzDate = toZonedTime(
        new Date(date),
        Intl.DateTimeFormat().resolvedOptions().timeZone
      )
      break
    default:
      break
  }

  return format(tzDate, options?.includeTime ? 'd MMMM HH:mm' : 'd MMMM', {
    locale,
    ...options
  })
}

function formatDuration(
  date1: Date | string | undefined | null,
  date2: Date | string | undefined | null,
  options?: FormatDurationOptions
): string {
  if (!date1 || !date2) {
    return '-'
  }

  const duration: Duration = intervalToDuration({
    start: new Date(date1),
    end: new Date(date2)
  })

  return _formatDuration(duration, {
    locale,
    format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'],
    ...options
  })
}

function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function addDays(
  date: Date | string | undefined | null,
  days: number
): Date | null {
  if (!date) {
    return null
  }

  return _addDays(new Date(date), days)
}

export const DateHelpers = {
  formatDistance,
  formatDuration,
  formatDate,
  getCurrentTimezone,
  addDays
}
