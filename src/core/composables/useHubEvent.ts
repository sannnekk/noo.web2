import { onScopeDispose } from 'vue'
import { RealtimeConnections } from '../realtime/connection-registry'

/**
 * Subscribes to one server-pushed message for the lifetime of the calling scope.
 *
 * Acquires the hub alongside the handler so a component that only listens does not also have to
 * call {@link useHub}; both take a reference and both release on unmount.
 *
 * @param path Hub path, e.g. `/notifications`.
 * @param method The server's client-contract method name. It carries the `Async` suffix, because
 *   SignalR uses the C# method name as the wire name.
 */
export function useHubEvent<TPayload>(
  path: string,
  method: string,
  handler: (payload: TPayload) => void
): void {
  const { connection, started } = RealtimeConnections.acquire(path)

  // Registered before the connection is up: SignalR queues handlers, and a message that arrives
  // during startup would otherwise be dropped.
  const wrapped = (payload: TPayload): void => handler(payload)

  connection.on(method, wrapped)

  // Nothing to do on failure here — useHub surfaces the error; this just must not reject.
  void started.catch(() => undefined)

  onScopeDispose(() => {
    connection.off(method, wrapped)
    RealtimeConnections.release(path)
  })
}
