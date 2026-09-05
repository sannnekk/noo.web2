import { onBeforeUnmount, watch } from 'vue'
import { GlobalEventBus } from '../events/event-bus'
import { useAuthStore } from '../stores/auth.store'
import { useNotificationsStore } from '../stores/notifications.store'

/**
 * Fallback for when the realtime hub is not carrying notifications.
 *
 * While the hub is connected no interval runs at all — every open tab used to issue a request a
 * minute whether anything had happened or not, and each one costs the API a session lookup and
 * two queries. The interval returns only when the socket is down. A single reconcile poll runs
 * on every (re)connect and whenever the tab becomes visible, to pick up anything missed while
 * the connection was gone or the tab was suspended.
 */
const POLL_INTERVAL_MS = 60_000

export function useNotificationsPolling(): void {
  const authStore = useAuthStore()
  const notificationsStore = useNotificationsStore()

  let intervalId: ReturnType<typeof setInterval> | undefined
  let isRealtimeConnected = false

  function isTabVisible(): boolean {
    return document.visibilityState === 'visible'
  }

  function poll(): void {
    if (!authStore.isAuthenticated || !isTabVisible()) {
      return
    }

    notificationsStore.pollUnread()
  }

  function stopPolling(): void {
    if (intervalId !== undefined) {
      clearInterval(intervalId)
      intervalId = undefined
    }
  }

  /** Polls once now, and keeps an interval running only while realtime is not covering us. */
  function startPolling(): void {
    stopPolling()
    poll()

    if (!isRealtimeConnected) {
      intervalId = setInterval(poll, POLL_INTERVAL_MS)
    }
  }

  function onVisibilityChange(): void {
    if (isTabVisible()) {
      // Polls even on a live hub: a backgrounded tab may have been suspended through a push.
      poll()
    }
  }

  function onRealtimeConnected(): void {
    isRealtimeConnected = true
    stopPolling()
    poll()
  }

  function onRealtimeDisconnected(): void {
    isRealtimeConnected = false

    if (authStore.isAuthenticated) {
      startPolling()
    }
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        startPolling()
      } else {
        stopPolling()
        notificationsStore.reset()
      }
    },
    { immediate: true }
  )

  GlobalEventBus.on('realtime:connected', onRealtimeConnected)
  GlobalEventBus.on('realtime:disconnected', onRealtimeDisconnected)
  document.addEventListener('visibilitychange', onVisibilityChange)

  onBeforeUnmount(() => {
    stopPolling()
    GlobalEventBus.off('realtime:connected', onRealtimeConnected)
    GlobalEventBus.off('realtime:disconnected', onRealtimeDisconnected)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
