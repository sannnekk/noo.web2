import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { GlobalEventBus } from '../events/event-bus'
import { RealtimeConnections } from '../realtime/connection-registry'
import { HubPaths } from '../realtime/hubs'
import { useAuthStore } from '../stores/auth.store'

/**
 * Owns the personal hub connection for the whole app. Call it once, from `App.vue`.
 *
 * Mirrors how `useNotificationsPolling` is structured — driven by the auth store, torn down on
 * logout — because it replaces that composable's job of keeping the notification list current.
 */
export function useRealtimeConnection(): { isConnected: Ref<boolean> } {
  const authStore = useAuthStore()
  const isConnected = ref(false)

  let release: (() => void) | null = null

  function setConnected(connected: boolean): void {
    if (isConnected.value === connected) {
      return
    }

    isConnected.value = connected
    GlobalEventBus.emit(
      connected ? 'realtime:connected' : 'realtime:disconnected',
      undefined
    )
  }

  function connect(): void {
    if (release !== null) {
      return
    }

    const { connection, started } = RealtimeConnections.acquire(
      HubPaths.notifications
    )

    release = () => {
      RealtimeConnections.release(HubPaths.notifications)
    }

    connection.onreconnected(() => setConnected(true))
    connection.onreconnecting(() => setConnected(false))
    connection.onclose(() => setConnected(false))

    started.then(
      () => setConnected(true),
      // Automatic reconnect takes over from here; the fallbacks stay on meanwhile.
      () => setConnected(false)
    )
  }

  function disconnect(): void {
    release?.()
    release = null
    setConnected(false)
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        connect()
      } else {
        disconnect()
        // Signing out must not leave a socket open on the old session.
        void RealtimeConnections.closeAll()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(disconnect)

  return { isConnected }
}
