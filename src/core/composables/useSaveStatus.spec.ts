import { describe, expect, test } from 'vitest'
import { useSaveStatus } from './useSaveStatus'

describe('useSaveStatus', () => {
  test('tracks loading state across begin/end', () => {
    const { isLoading, lastSavedAt, beginSave, endSave } = useSaveStatus()

    expect(isLoading.value).toBe(false)
    expect(lastSavedAt.value).toBeNull()

    beginSave()

    expect(isLoading.value).toBe(true)
    expect(lastSavedAt.value).toBeNull()

    endSave({ success: true })

    expect(isLoading.value).toBe(false)
    expect(lastSavedAt.value).toBeInstanceOf(Date)
  })

  test('marks error state and leaves lastSavedAt untouched on failure', () => {
    const { lastSavedAt, hasError, beginSave, endSave } = useSaveStatus()

    beginSave()
    endSave({ success: true })

    const firstSavedAt = lastSavedAt.value

    beginSave()
    endSave({ success: false })

    expect(hasError.value).toBe(true)
    expect(lastSavedAt.value).toBe(firstSavedAt)
  })

  test('reset clears all state', () => {
    const { isLoading, lastSavedAt, hasError, beginSave, endSave, reset } =
      useSaveStatus()

    beginSave()
    endSave({ success: false })

    expect(hasError.value).toBe(true)

    reset()

    expect(isLoading.value).toBe(false)
    expect(lastSavedAt.value).toBeNull()
    expect(hasError.value).toBe(false)
  })

  test('updates timestamp on subsequent successful saves', () => {
    const { lastSavedAt, beginSave, endSave } = useSaveStatus()

    beginSave()
    endSave({ success: true })
    const first = lastSavedAt.value

    beginSave()
    endSave({ success: true })
    const second = lastSavedAt.value

    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(second?.getTime()).toBeGreaterThanOrEqual(first!.getTime())
  })
})
