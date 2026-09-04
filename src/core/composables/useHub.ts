import { HubConnectionState } from '@microsoft/signalr'
import { onScopeDispose, readonly, ref, type Ref } from 'vue'
import { RealtimeConnections } from '../realtime/connection-registry'

export interface UseHubReturn {
  /** Whether messages are currently arriving. Bind connection indicators to this. */
  isConnected: Readonly<Ref<boolean>>
  /** Set when the initial connection attempt failed; cleared once connected. */
  error: Readonly<Ref<unknown>>
}

/**
 * Holds a shared connection to one hub for the lifetime of the calling scope.
 *
 * The connection is reference counted, so several components may call this for the same hub and
 * only the last one to unmount releases it. Nothing here starts a second socket.
 */
export function useHub(path: string): UseHubReturn {
  const isConnected = ref(false)
  const error = ref<unknown>(null)

  const { connection, started } = RealtimeConnections.acquire(path)

  function sync(): void {
    isConnected.value = connection.state === HubConnectionState.Connected
  }

  started
    .then(() => {
      error.value = null
      sync()
    })
    .catch((reason: unknown) => {
      error.value = reason
      sync()
    })

  connection.onreconnected(() => {
    error.value = null
    sync()
  })
  connection.onreconnecting(sync)
  connection.onclose(sync)

  sync()

  onScopeDispose(() => {
    RealtimeConnections.release(path)
  })

  return { isConnected: readonly(isConnected), error: readonly(error) }
}
