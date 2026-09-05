import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { GlobalEventBus } from '../events/event-bus'
import { useAuthStore } from '../stores/auth.store'
import { useNotificationsStore } from '../stores/notifications.store'
import { useNotificationsPolling } from './useNotificationsPolling'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')

  return { ...actual, onBeforeUnmount: () => undefined }
})

const POLL_INTERVAL_MS = 60_000

describe('useNotificationsPolling', () => {
  let pollSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    authStore.userId = 'user-1'

    pollSpy = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(useNotificationsStore(), 'pollUnread').mockImplementation(pollSpy)

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('polls on an interval while realtime is not connected', () => {
    useNotificationsPolling()

    expect(pollSpy).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(POLL_INTERVAL_MS * 3)

    expect(pollSpy).toHaveBeenCalledTimes(4)
  })

  // The saving this whole change exists for: an open tab on a live hub makes no requests at all.
  test('stops the interval once realtime connects', () => {
    useNotificationsPolling()
    pollSpy.mockClear()

    GlobalEventBus.emit('realtime:connected', undefined)

    // One reconcile poll for whatever arrived before the socket came up.
    expect(pollSpy).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(POLL_INTERVAL_MS * 5)

    expect(pollSpy).toHaveBeenCalledTimes(1)
  })

  test('resumes polling when realtime drops', () => {
    useNotificationsPolling()
    GlobalEventBus.emit('realtime:connected', undefined)
    pollSpy.mockClear()

    GlobalEventBus.emit('realtime:disconnected', undefined)

    expect(pollSpy).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(POLL_INTERVAL_MS * 2)

    expect(pollSpy).toHaveBeenCalledTimes(3)
  })

  // A tab can be suspended through a push, so becoming visible reconciles even on a live hub.
  test('reconciles when the tab becomes visible even while connected', () => {
    useNotificationsPolling()
    GlobalEventBus.emit('realtime:connected', undefined)
    pollSpy.mockClear()

    document.dispatchEvent(new Event('visibilitychange'))

    expect(pollSpy).toHaveBeenCalledTimes(1)
  })

  test('does not poll while the tab is hidden', () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')

    useNotificationsPolling()

    vi.advanceTimersByTime(POLL_INTERVAL_MS * 3)

    expect(pollSpy).not.toHaveBeenCalled()
  })
})
