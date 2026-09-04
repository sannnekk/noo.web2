import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr'
import { appConfig } from '../config/app.config'
import { getAccessToken } from './access-token'
import { JitteredRetryPolicy } from './retry-policy'

/**
 * How long a hub with no subscribers is kept open before closing. Navigating between two pages
 * that use the same hub releases and re-acquires it within the same tick; without a grace period
 * that would tear the socket down and immediately rebuild it, and every reconnect costs the
 * server a token validation and a session lookup.
 */
const IDLE_GRACE_MS = 30_000

interface Entry {
  connection: HubConnection
  subscribers: number
  closeTimer: ReturnType<typeof setTimeout> | null
  started: Promise<void> | null
}

const entries = new Map<string, Entry>()

function buildConnection(path: string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(`${appConfig.hubUrl}${path}`, {
      // Browsers cannot set headers on a WebSocket handshake, so SignalR puts the token in the
      // query string. The factory runs again on every reconnect, which is what keeps a
      // long-lived connection from re-handshaking with an expired token.
      accessTokenFactory: getAccessToken
    })
    .withAutomaticReconnect(new JitteredRetryPolicy())
    .configureLogging(
      appConfig.isProduction ? LogLevel.Warning : LogLevel.Information
    )
    .build()
}

/**
 * Returns the shared connection for a hub path, creating and starting it on first use.
 *
 * One `HubConnection` is one WebSocket — SignalR does not multiplex across hubs — so connections
 * are shared by path and reference counted. Callers must pair every acquire with a release.
 */
export function acquire(path: string): {
  connection: HubConnection
  started: Promise<void>
} {
  let entry = entries.get(path)

  if (entry === undefined) {
    entry = {
      connection: buildConnection(path),
      subscribers: 0,
      closeTimer: null,
      started: null
    }

    entries.set(path, entry)
  }

  if (entry.closeTimer !== null) {
    clearTimeout(entry.closeTimer)
    entry.closeTimer = null
  }

  entry.subscribers += 1

  // A failed start is not cached: the next acquire gets a fresh attempt rather than inheriting
  // a permanently rejected promise.
  entry.started ??= entry.connection.start().catch((error: unknown) => {
    const current = entries.get(path)

    if (current !== undefined) {
      current.started = null
    }

    throw error
  })

  return { connection: entry.connection, started: entry.started }
}

export function release(path: string): void {
  const entry = entries.get(path)

  if (entry === undefined) {
    return
  }

  entry.subscribers = Math.max(0, entry.subscribers - 1)

  if (entry.subscribers > 0 || entry.closeTimer !== null) {
    return
  }

  entry.closeTimer = setTimeout(() => {
    const current = entries.get(path)

    if (current === undefined || current.subscribers > 0) {
      return
    }

    entries.delete(path)
    void current.connection.stop()
  }, IDLE_GRACE_MS)
}

/** Drops every connection at once — used on logout, when no socket should outlive the session. */
export async function closeAll(): Promise<void> {
  const open = [...entries.values()]

  entries.clear()

  await Promise.all(
    open.map((entry) => {
      if (entry.closeTimer !== null) {
        clearTimeout(entry.closeTimer)
      }

      return entry.connection.stop().catch(() => undefined)
    })
  )
}

export function stateOf(path: string): HubConnectionState {
  return entries.get(path)?.connection.state ?? HubConnectionState.Disconnected
}

/** Test seam: the registry is a module-level singleton by design. */
export function resetForTests(): void {
  for (const entry of entries.values()) {
    if (entry.closeTimer !== null) {
      clearTimeout(entry.closeTimer)
    }
  }

  entries.clear()
}

export const RealtimeConnections = {
  acquire,
  release,
  closeAll,
  stateOf,
  resetForTests,
  IDLE_GRACE_MS
}
