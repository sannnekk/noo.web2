import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useLoadingProgress } from './useLoadingProgress'

describe('useLoadingProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should start at zero and advance on its own', () => {
    const { progress, start } = useLoadingProgress()

    start()
    expect(progress.value).toBe(0)

    vi.advanceTimersByTime(200)
    expect(progress.value).toBeGreaterThan(0)
  })

  test('should slow down instead of reaching the ceiling', () => {
    const { progress, start } = useLoadingProgress({ ceiling: 90 })

    start()
    vi.advanceTimersByTime(200 * 200)

    expect(progress.value).toBeLessThan(90)
    expect(progress.value).toBeGreaterThan(80)
  })

  test('should follow the transfer once it turns out to be measurable', () => {
    const { progress, start, report } = useLoadingProgress()

    start()
    report({ loaded: 50, total: 200, bytes: 50 })

    expect(progress.value).toBe(25)
  })

  test('should stop guessing once real progress arrives', () => {
    const { progress, start, report } = useLoadingProgress()

    start()
    report({ loaded: 50, total: 200, bytes: 50 })
    vi.advanceTimersByTime(200 * 10)

    expect(progress.value).toBe(25)
  })

  test('should ignore progress of an unmeasurable transfer', () => {
    const { progress, start, report } = useLoadingProgress()

    start()
    vi.advanceTimersByTime(200)

    const guessed = progress.value

    report({ loaded: 50, bytes: 50 })
    expect(progress.value).toBe(guessed)

    // …and keeps guessing, since nothing better showed up.
    vi.advanceTimersByTime(200)
    expect(progress.value).toBeGreaterThan(guessed)
  })

  test('should never go backwards', () => {
    const { progress, start, report } = useLoadingProgress()

    start()
    report({ loaded: 150, total: 200, bytes: 150 })
    report({ loaded: 20, total: 200, bytes: 20 })

    expect(progress.value).toBe(75)
  })

  test('finish should complete the run and stop the timer', () => {
    const { progress, isRunning, start, finish } = useLoadingProgress()

    start()
    finish()

    expect(progress.value).toBe(100)
    expect(isRunning.value).toBe(false)

    vi.advanceTimersByTime(200 * 10)
    expect(progress.value).toBe(100)
  })

  test('reset should return to zero without passing through 100', () => {
    const { progress, isRunning, start, reset } = useLoadingProgress()

    start()
    vi.advanceTimersByTime(200)
    reset()

    expect(progress.value).toBe(0)
    expect(isRunning.value).toBe(false)
  })

  test('should start over on a second run', () => {
    const { progress, start } = useLoadingProgress()

    start()
    vi.advanceTimersByTime(200 * 5)
    expect(progress.value).toBeGreaterThan(0)

    start()
    expect(progress.value).toBe(0)
  })
})
