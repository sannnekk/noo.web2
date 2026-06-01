import { DateHelpers } from '@/core/utils/dates'
import { describe, expect, it } from 'vitest'

const MOSCOW = '2026-06-02T15:30:00+03:00'

describe('DateHelpers.formatDate', () => {
  it('formats an absolute date in Moscow time', () => {
    expect(DateHelpers.formatDate(MOSCOW, { timezone: 'Europe/Moscow' })).toBe(
      '2 июня'
    )
  })

  it('includes the time when requested', () => {
    expect(
      DateHelpers.formatDate(MOSCOW, {
        timezone: 'Europe/Moscow',
        includeTime: true
      })
    ).toBe('2 июня 15:30')
  })

  it('renders the offset instant correctly in UTC', () => {
    expect(
      DateHelpers.formatDate(MOSCOW, { timezone: 'UTC', includeTime: true })
    ).toBe('2 июня 12:30')
  })

  it('shows the year when it differs from the current year', () => {
    expect(
      DateHelpers.formatDate('2019-01-05T10:00:00+03:00', {
        timezone: 'Europe/Moscow'
      })
    ).toBe('5 января 2019')
  })

  it('returns a dash for empty input', () => {
    expect(DateHelpers.formatDate(null)).toBe('-')
    expect(DateHelpers.formatDate(undefined)).toBe('-')
  })
})

describe('DateHelpers.formatRelative', () => {
  const now = new Date('2026-06-02T15:00:00+03:00')

  const cases: [string, string][] = [
    ['2026-06-02T14:59:40+03:00', 'только что'],
    ['2026-06-02T14:59:00+03:00', '1 минуту назад'],
    ['2026-06-02T14:37:00+03:00', '23 минуты назад'],
    ['2026-06-02T14:00:00+03:00', '1 час назад'],
    ['2026-06-02T13:00:00+03:00', '2 часа назад'],
    ['2026-05-31T15:00:00+03:00', '2 дня назад'],
    // future
    ['2026-06-02T15:00:20+03:00', 'через несколько секунд'],
    ['2026-06-02T15:05:00+03:00', 'через 5 минут'],
    ['2026-06-04T15:00:00+03:00', 'через 2 дня'],
    ['2026-06-23T15:00:00+03:00', 'через 3 недели']
  ]

  it.each(cases)('formats %s as "%s"', (value, expected) => {
    expect(DateHelpers.formatRelative(value, now)).toBe(expected)
  })

  it('returns a dash for empty input', () => {
    expect(DateHelpers.formatRelative(null, now)).toBe('-')
  })
})

describe('DateHelpers.formatDuration', () => {
  it('breaks an interval into Russian units', () => {
    const from = '2026-06-01T10:00:00+03:00'
    const to = '2026-06-03T13:15:00+03:00'

    expect(DateHelpers.formatDuration(from, to)).toBe('2 дня 3 часа 15 минут')
  })

  it('handles a single unit', () => {
    expect(
      DateHelpers.formatDuration(
        '2026-06-01T10:00:00+03:00',
        '2026-06-01T11:00:00+03:00'
      )
    ).toBe('1 час')
  })

  it('renders an empty interval as zero seconds', () => {
    const date = '2026-06-01T10:00:00+03:00'

    expect(DateHelpers.formatDuration(date, date)).toBe('0 секунд')
  })
})

describe('DateHelpers.addDays', () => {
  it('adds days, returning a new Date', () => {
    const result = DateHelpers.addDays('2026-06-01T10:00:00+03:00', 5)

    expect(result?.toISOString()).toBe(
      new Date('2026-06-06T10:00:00+03:00').toISOString()
    )
  })

  it('returns null for empty input', () => {
    expect(DateHelpers.addDays(null, 5)).toBeNull()
  })
})

describe('DateHelpers Moscow parts', () => {
  it('reads the Moscow wall-clock parts of an instant', () => {
    // 12:30 UTC is 15:30 in Moscow.
    expect(DateHelpers.toMoscowParts(new Date('2026-06-02T12:30:00Z'))).toEqual(
      {
        year: 2026,
        month: 6,
        day: 2,
        hour: 15,
        minute: 30,
        second: 0
      }
    )
  })

  it('builds the instant for given Moscow wall-clock parts', () => {
    const instant = DateHelpers.fromMoscowParts({
      year: 2026,
      month: 6,
      day: 2,
      hour: 23,
      minute: 59,
      second: 59
    })

    expect(instant.toISOString()).toBe(
      new Date('2026-06-02T23:59:59+03:00').toISOString()
    )
  })

  it('round-trips parts -> instant -> parts', () => {
    const parts = {
      year: 2026,
      month: 1,
      day: 15,
      hour: 8,
      minute: 5,
      second: 0
    }

    expect(
      DateHelpers.toMoscowParts(DateHelpers.fromMoscowParts(parts))
    ).toEqual(parts)
  })
})
