/**
 * Minimal `date-fns` Locale for the Russian calendar of `@vuepic/vue-datepicker`,
 * built entirely from `Intl` so the app keeps no real dependency on `date-fns`.
 *
 * The picker is configured with numeric display formats (`dd.MM.yyyy`), so the
 * only locale data it actually exercises is `localize.month` / `localize.day`
 * for the calendar's month and weekday labels. Everything else is a thin stub
 * good enough to satisfy `date-fns`' Locale shape.
 *
 * Typed loosely on purpose: `date-fns` is not a direct dependency, so the
 * consumer casts this to the picker's own `locale` prop type.
 */
type LocalizeWidth = 'narrow' | 'short' | 'abbreviated' | 'wide'

const RU_LOCALE = 'ru-RU'

/** A known Sunday — `date-fns` day index 0 is Sunday. */
const SUNDAY = new Date(2023, 0, 1)

function intlWidth(
  width: LocalizeWidth | undefined
): 'long' | 'short' | 'narrow' {
  switch (width) {
    case 'narrow':
      return 'narrow'
    case 'short':
    case 'abbreviated':
      return 'short'
    default:
      return 'long'
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function localizeMonth(
  index: number,
  options?: { width?: LocalizeWidth }
): string {
  const formatter = new Intl.DateTimeFormat(RU_LOCALE, {
    month: intlWidth(options?.width)
  })

  return capitalize(formatter.format(new Date(2023, index, 1)))
}

function localizeDay(
  index: number,
  options?: { width?: LocalizeWidth }
): string {
  const formatter = new Intl.DateTimeFormat(RU_LOCALE, {
    weekday: intlWidth(options?.width)
  })
  const date = new Date(SUNDAY)

  date.setDate(date.getDate() + index)

  return capitalize(formatter.format(date))
}

const localize = {
  ordinalNumber: (value: number) => String(value),
  era: (value: number) => (value ? 'н. э.' : 'до н. э.'),
  quarter: (value: number) => String(value),
  month: localizeMonth,
  day: localizeDay,
  dayPeriod: (value: number) => (value ? 'PM' : 'AM')
}

const formatLong = {
  date: () => 'dd.MM.yyyy',
  time: () => 'HH:mm',
  dateTime: () => 'dd.MM.yyyy HH:mm'
}

export const ruLocale = {
  code: 'ru',
  formatDistance: () => '',
  formatRelative: () => '',
  localize,
  formatLong,
  match: {},
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1
  }
}
