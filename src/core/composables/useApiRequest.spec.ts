import { describe, expect, test, vi } from 'vitest'
import { useApiRequest } from './useApiRequest'

describe('useApiRequest', () => {
  test('handles success and progress updates', async () => {
    const request = vi.fn(async (_payload: { id: string }, onProgress) => {
      onProgress?.({ loaded: 50, total: 100, bytes: 50 })
      return { data: { ok: true }, meta: { total: 1 } }
    })

    const onSuccess = vi.fn()
    const { execute, data, metadata, error, isLoading, progress } =
      useApiRequest(request, onSuccess)

    const promise = execute({ id: '1' })

    expect(isLoading.value).toBe(true)

    await promise

    expect(data.value).toEqual({ ok: true })
    expect(metadata?.value).toEqual({ total: 1 })
    expect(error.value).toBeNull()
    expect(progress.value).toBeNull()
    expect(onSuccess).toHaveBeenCalled()
    expect(isLoading.value).toBe(false)
  })

  test('handles error responses', async () => {
    const request = vi.fn(async () => ({
      error: { id: 'ERR', statusCode: 500, name: 'Error', payload: null }
    }))

    const onError = vi.fn()
    const { execute, error } = useApiRequest(request, undefined, onError)

    await execute(undefined)

    expect(error.value?.id).toBe('ERR')
    expect(onError).toHaveBeenCalled()
  })

  test('does not call onSuccess for errors', async () => {
    const request = vi.fn(async () => ({
      error: { id: 'ERR', statusCode: 500, name: 'Error', payload: null }
    }))

    const onSuccess = vi.fn()
    const { execute } = useApiRequest(request, onSuccess)

    await execute(undefined)

    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('sets progress to null when total is missing', async () => {
    const request = vi.fn(async (_payload: { id: string }, onProgress) => {
      onProgress?.({ loaded: 50, bytes: 50 })
      return { data: { ok: true }, meta: null }
    })

    const { execute, progress } = useApiRequest(request)

    await execute({ id: '1' })

    expect(progress.value).toBeNull()
  })

  test('follows the transfer while the request is in flight', async () => {
    let seenProgress: number | null = null

    const request = vi.fn(async (_payload: void, onProgress) => {
      onProgress?.({ loaded: 40, total: 80, bytes: 40 })
      seenProgress = progress.value

      return { data: { ok: true }, meta: null }
    })

    const { execute, progress } = useApiRequest(request)

    await execute()

    expect(seenProgress).toBe(50)
    // …and reads as idle again once there is nothing in flight.
    expect(progress.value).toBeNull()
  })

  test('reports progress even when the transfer size is unknown', async () => {
    vi.useFakeTimers()

    let seenProgress: number | null = null

    const request = vi.fn(async () => {
      // Nothing measurable ever arrives — the guess is all there is.
      await vi.advanceTimersByTimeAsync(600)
      seenProgress = progress.value

      return { data: { ok: true }, meta: null }
    })

    const { execute, progress } = useApiRequest(request)

    await execute()

    expect(seenProgress).toBeGreaterThan(0)

    vi.useRealTimers()
  })

  test('leaves progress alone when tracking is turned off', async () => {
    vi.useFakeTimers()

    let seenProgress: number | null = null

    const request = vi.fn(async () => {
      await vi.advanceTimersByTimeAsync(600)
      seenProgress = progress.value

      return { data: { ok: true }, meta: null }
    })

    const { execute, progress } = useApiRequest(request, undefined, undefined, {
      trackProgress: false
    })

    await execute()

    expect(seenProgress).toBeNull()

    vi.useRealTimers()
  })
})
