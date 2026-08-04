import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { LocalStorage } from '../local-storage.utils'

describe('LocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should round-trip a value', () => {
    LocalStorage.set('answers', { a: 1 })

    expect(LocalStorage.get('answers')).toEqual({ a: 1 })
  })

  test('should namespace the stored keys', () => {
    LocalStorage.set('answers', 'value')

    expect(window.localStorage.getItem('noo.answers')).not.toBeNull()
    expect(window.localStorage.getItem('answers')).toBeNull()
  })

  test('should read a missing key as undefined', () => {
    expect(LocalStorage.get('nothing')).toBeUndefined()
    expect(LocalStorage.isSet('nothing')).toBe(false)
  })

  test('should keep a value while its ttl lasts', () => {
    vi.useFakeTimers()

    LocalStorage.set('answers', 'value', { ttl: 1000 })
    vi.advanceTimersByTime(999)

    expect(LocalStorage.get('answers')).toBe('value')
  })

  test('should drop a value once its ttl has passed', () => {
    vi.useFakeTimers()

    LocalStorage.set('answers', 'value', { ttl: 1000 })
    vi.advanceTimersByTime(1001)

    expect(LocalStorage.get('answers')).toBeUndefined()
    expect(window.localStorage.getItem('noo.answers')).toBeNull()
  })

  test('should keep a value without a ttl indefinitely', () => {
    vi.useFakeTimers()

    LocalStorage.set('answers', 'value')
    vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 365)

    expect(LocalStorage.get('answers')).toBe('value')
  })

  test('should revive dates only when asked to', () => {
    const date = new Date('2026-08-04T10:00:00.000Z')

    LocalStorage.set('answers', { date })

    expect(LocalStorage.get<{ date: unknown }>('answers')?.date).toBe(
      date.toISOString()
    )
    expect(
      LocalStorage.get<{ date: unknown }>('answers', { withDates: true })?.date
    ).toEqual(date)
  })

  test('should read corrupted json as missing', () => {
    window.localStorage.setItem('noo.answers', '{ not json')

    expect(LocalStorage.get('answers')).toBeUndefined()
  })

  test('should read a value that is not an envelope as missing', () => {
    window.localStorage.setItem('noo.answers', '"raw value"')

    expect(LocalStorage.get('answers')).toBeUndefined()
  })

  test('remove should delete a single record', () => {
    LocalStorage.set('answers', 'value')
    LocalStorage.remove('answers')

    expect(LocalStorage.get('answers')).toBeUndefined()
  })

  test('prune should drop expired records and keep the live ones', () => {
    vi.useFakeTimers()

    LocalStorage.set('stale', 'value', { ttl: 1000 })
    LocalStorage.set('fresh', 'value', { ttl: 10000 })
    LocalStorage.set('forever', 'value')

    vi.advanceTimersByTime(1001)
    LocalStorage.prune()

    expect(window.localStorage.getItem('noo.stale')).toBeNull()
    expect(LocalStorage.get('fresh')).toBe('value')
    expect(LocalStorage.get('forever')).toBe('value')
  })

  test('clear should remove its own records', () => {
    LocalStorage.set('answers', 'value')
    LocalStorage.set('other', 'value', { ttl: 1000 })

    LocalStorage.clear()

    expect(LocalStorage.get('answers')).toBeUndefined()
    expect(LocalStorage.get('other')).toBeUndefined()
  })

  // The `noo.` namespace is shared with whatever else the app stores by hand —
  // the theme, for one — so sweeping must stay off anything not written here.
  test('prune and clear should leave namespaced foreign values alone', () => {
    window.localStorage.setItem('noo.theme', '"dark"')
    window.localStorage.setItem('other-app', 'value')

    LocalStorage.prune()
    LocalStorage.clear()

    expect(window.localStorage.getItem('noo.theme')).toBe('"dark"')
    expect(window.localStorage.getItem('other-app')).toBe('value')
  })
})
