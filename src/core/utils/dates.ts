/**
 * Date / time helpers.
 *
 * The backend always emits timestamps as Moscow-time instants carrying an
 * explicit `+03:00` offset, so every value we receive is an unambiguous point
 * in time. These helpers render that instant in a chosen timezone (Moscow,
 * the user's local zone, or UTC) and produce messenger-style relative strings.
 *
 * Intentionally dependency-free: formatting relies on the platform `Intl` API.
 */

const RU_LOCALE = 'ru-RU'

/** Moscow is a fixed UTC+3 offset with no DST. */
const MOSCOW_OFFSET_MINUTES = 3 * 60
const MOSCOW_OFFSET_SUFFIX = '+03:00'

export type TimezoneName = 'UTC' | 'Europe/Moscow' | 'local'

/** Wall-clock components of an instant, as seen in a given timezone. */
export interface DateParts {
  year: number
  /** 1-12. */
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface Timezone {
  /**
   * Timezone used for formatting. Defaults to the user's local timezone.
   */
  timezone?: TimezoneName
}

export interface FormatDateOptions extends Timezone {
  /**
   * Append the time (`HH:mm`) after the date.
   */
  includeTime?: boolean
}

/** Russian plural forms: [one, few, many]. */
type PluralForms = readonly [string, string, string]

const SECOND_FORMS: PluralForms = ['секунду', 'секунды', 'секунд']
const MINUTE_FORMS: PluralForms = ['минуту', 'минуты', 'минут']
const HOUR_FORMS: PluralForms = ['час', 'часа', 'часов']
const DAY_FORMS: PluralForms = ['день', 'дня', 'дней']
const WEEK_FORMS: PluralForms = ['неделю', 'недели', 'недель']
const MONTH_FORMS: PluralForms = ['месяц', 'месяца', 'месяцев']
const YEAR_FORMS: PluralForms = ['год', 'года', 'лет']

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function resolveTimeZone(timezone?: TimezoneName): string | undefined {
  switch (timezone) {
    case 'UTC':
      return 'UTC'
    case 'Europe/Moscow':
      return 'Europe/Moscow'
    case 'local':
    default:
      return undefined
  }
}

/**
 * Picks the correct Russian plural form for `count`.
 */
function pluralize(count: number, [one, few, many]: PluralForms): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few
  }

  return many
}

function relativePhrase(
  count: number,
  forms: PluralForms,
  isFuture: boolean
): string {
  const unit = pluralize(count, forms)

  return isFuture ? `через ${count} ${unit}` : `${count} ${unit} назад`
}

/**
 * Formats an absolute calendar date in the requested timezone, e.g.
 * `2 июня`, `2 июня 15:00`, or `2 июня 2024 15:00` (the year is shown only
 * when it differs from the current year in that timezone).
 */
function formatDate(
  value: Date | string | null | undefined,
  options?: FormatDateOptions
): string {
  const date = toDate(value)

  if (!date) {
    return '-'
  }

  const timeZone = resolveTimeZone(options?.timezone)
  const parts = new Intl.DateTimeFormat(RU_LOCALE, {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(options?.includeTime
      ? { hour: '2-digit', minute: '2-digit', hour12: false }
      : {})
  }).formatToParts(date)

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? ''

  const currentYear = new Intl.DateTimeFormat(RU_LOCALE, {
    timeZone,
    year: 'numeric'
  }).format(new Date())

  let result = `${part('day')} ${part('month')}`

  if (part('year') !== currentYear) {
    result += ` ${part('year')}`
  }

  if (options?.includeTime) {
    result += ` ${part('hour')}:${part('minute')}`
  }

  return result
}

/**
 * Messenger-style relative time. Handles both past (`23 минуты назад`) and
 * future (`через 2 дня`) without any "приблизительно"-style hedging.
 *
 * `now` is a parameter so callers can pass a reactive clock (see `useNow`)
 * and have the result re-evaluate as time passes.
 */
function formatRelative(
  value: Date | string | null | undefined,
  now: Date = new Date()
): string {
  const date = toDate(value)

  if (!date) {
    return '-'
  }

  const diffMs = date.getTime() - now.getTime()
  const isFuture = diffMs > 0
  const seconds = Math.round(Math.abs(diffMs) / 1000)

  if (seconds < 45) {
    return isFuture ? 'через несколько секунд' : 'только что'
  }

  const minutes = Math.round(seconds / 60)

  if (minutes < 60) {
    return relativePhrase(Math.max(minutes, 1), MINUTE_FORMS, isFuture)
  }

  const hours = Math.round(minutes / 60)

  if (hours < 24) {
    return relativePhrase(hours, HOUR_FORMS, isFuture)
  }

  const days = Math.round(hours / 24)

  if (days < 7) {
    return relativePhrase(days, DAY_FORMS, isFuture)
  }

  const weeks = Math.round(days / 7)

  if (weeks < 5) {
    return relativePhrase(weeks, WEEK_FORMS, isFuture)
  }

  const months = Math.round(days / 30)

  if (months < 12) {
    return relativePhrase(months, MONTH_FORMS, isFuture)
  }

  const years = Math.round(days / 365)

  return relativePhrase(years, YEAR_FORMS, isFuture)
}

/**
 * Human-readable length of the interval between two dates, e.g.
 * `2 дня 3 часа 15 минут`. Empty intervals render as `0 секунд`.
 */
function formatDuration(
  from: Date | string | null | undefined,
  to: Date | string | null | undefined
): string {
  const start = toDate(from)
  const end = toDate(to)

  if (!start || !end) {
    return '-'
  }

  let totalSeconds = Math.round(
    Math.abs(end.getTime() - start.getTime()) / 1000
  )

  const units: { seconds: number; forms: PluralForms }[] = [
    { seconds: 7 * 24 * 3600, forms: WEEK_FORMS },
    { seconds: 24 * 3600, forms: DAY_FORMS },
    { seconds: 3600, forms: HOUR_FORMS },
    { seconds: 60, forms: MINUTE_FORMS },
    { seconds: 1, forms: SECOND_FORMS }
  ]

  const segments: string[] = []

  for (const { seconds, forms } of units) {
    const count = Math.floor(totalSeconds / seconds)

    if (count > 0) {
      segments.push(`${count} ${pluralize(count, forms)}`)
      totalSeconds -= count * seconds
    }
  }

  return segments.length > 0
    ? segments.join(' ')
    : `0 ${pluralize(0, SECOND_FORMS)}`
}

function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Wall-clock parts of an instant as seen in Moscow time. Used by inputs so the
 * date/time a user types is interpreted in the business timezone, matching how
 * the backend stores it and how it is displayed.
 */
function toMoscowParts(value: Date): DateParts {
  const shifted = new Date(value.getTime() + MOSCOW_OFFSET_MINUTES * 60_000)

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds()
  }
}

/** Builds the instant for the given Moscow wall-clock parts. */
function fromMoscowParts(parts: DateParts): Date {
  const pad = (value: number, width = 2): string =>
    String(value).padStart(width, '0')

  return new Date(
    `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}` +
      `T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}` +
      MOSCOW_OFFSET_SUFFIX
  )
}

function addDays(
  date: Date | string | null | undefined,
  days: number
): Date | null {
  const parsed = toDate(date)

  if (!parsed) {
    return null
  }

  const result = new Date(parsed)

  result.setDate(result.getDate() + days)

  return result
}

export const DateHelpers = {
  formatDate,
  formatRelative,
  formatDuration,
  getCurrentTimezone,
  toMoscowParts,
  fromMoscowParts,
  addDays
}
