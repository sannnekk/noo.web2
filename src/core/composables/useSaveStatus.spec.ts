import { describe, expect, test } from 'vitest'
import { useSaveStatus } from './useSaveStatus'

describe('useSaveStatus', () => {
  test('tracks save status and timestamps', () => {
    const { isLoading, lastSavedAt, pushSaveStatus, reset } = useSaveStatus()

    expect(isLoading.value).toBe(false)
    expect(lastSavedAt.value).toBeNull()

    pushSaveStatus()

    expect(isLoading.value).toBe(true)
    expect(lastSavedAt.value).toBeInstanceOf(Date)

    reset()

    expect(isLoading.value).toBe(false)
    expect(lastSavedAt.value).toBeNull()
  })

  test('updates timestamp on subsequent saves', () => {
    const { lastSavedAt, pushSaveStatus } = useSaveStatus()

    pushSaveStatus()
    const first = lastSavedAt.value

    pushSaveStatus()
    const second = lastSavedAt.value

    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(second?.getTime()).toBeGreaterThanOrEqual(first!.getTime())
  })
})
