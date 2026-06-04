import { onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { useNotificationsStore } from '../stores/notifications.store'

const POLL_INTERVAL_MS = 60_000

export function useNotificationsPolling(): void {
  const authStore = useAuthStore()
  const notificationsStore = useNotificationsStore()

  let intervalId: ReturnType<typeof setInterval> | undefined

  function isTabVisible(): boolean {
    return document.visibilityState === 'visible'
  }

  function poll(): void {
    if (!authStore.isAuthenticated || !isTabVisible()) {
      return
    }

    notificationsStore.pollUnread()
  }

  function startPolling(): void {
    stopPolling()
    poll()
    intervalId = setInterval(poll, POLL_INTERVAL_MS)
  }

  function stopPolling(): void {
    if (intervalId !== undefined) {
      clearInterval(intervalId)
      intervalId = undefined
    }
  }

  function onVisibilityChange(): void {
    if (isTabVisible()) {
      poll()
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

  document.addEventListener('visibilitychange', onVisibilityChange)

  onBeforeUnmount(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
