import { HubConnectionState } from '@microsoft/signalr'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const built: FakeConnection[] = []

/** Errors the next start attempts should fail with, oldest first. */
const pendingStartErrors: Error[] = []

class FakeConnection {
  public state: HubConnectionState = HubConnectionState.Disconnected
  public serverTimeoutInMilliseconds = 30_000
  public keepAliveIntervalInMilliseconds = 15_000
  public start = vi.fn(async () => {
    const failure = pendingStartErrors.shift()

    if (failure !== undefined) {
      throw failure
    }

    this.state = HubConnectionState.Connected
  })
  public stop = vi.fn(async () => {
    this.state = HubConnectionState.Disconnected
  })
  public on = vi.fn()
  public off = vi.fn()
  public reconnectedHandlers: Array<() => void> = []
  public onreconnected = vi.fn((handler: () => void) => {
    this.reconnectedHandlers.push(handler)
  })
  public onreconnecting = vi.fn()
  public onclose = vi.fn()

  /** What SignalR does after it restores a dropped socket. */
  public simulateReconnected(): void {
    this.reconnectedHandlers.forEach((handler) => handler())
  }
}

vi.mock('@microsoft/signalr', async () => {
  const actual =
    await vi.importActual<typeof import('@microsoft/signalr')>(
      '@microsoft/signalr'
    )

  class FakeBuilder {
    withUrl() {
      return this
    }
    withAutomaticReconnect() {
      return this
    }
    configureLogging() {
      return this
    }
    build() {
      const connection = new FakeConnection()
      built.push(connection)

      return connection
    }
  }

  return {
    ...actual,
    HubConnectionBuilder: FakeBuilder
  }
})

const { RealtimeConnections } = await import('./connection-registry')
const { RealtimeTiming } = await import('./timing')

describe('connection-registry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    built.length = 0
    pendingStartErrors.length = 0
    RealtimeConnections.resetForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('starts one connection per hub path', () => {
    RealtimeConnections.acquire('/notifications')
    RealtimeConnections.acquire('/notifications')

    expect(built).toHaveLength(1)
    expect(built[0].start).toHaveBeenCalledTimes(1)
  })

  // The client's default server timeout (30s) equals the server's ping interval, so a
  // connection left on the defaults gives up exactly when the next ping is due and re-negotiates
  // every ~30 seconds. The timeout must be at least double the server's keep-alive.
  test('gives the connection a server timeout of at least twice the keep-alive', () => {
    RealtimeConnections.acquire('/notifications')

    expect(built[0].serverTimeoutInMilliseconds).toBe(
      RealtimeTiming.serverTimeoutMs
    )
    expect(built[0].keepAliveIntervalInMilliseconds).toBe(
      RealtimeTiming.keepAliveMs
    )
    expect(RealtimeTiming.serverTimeoutMs).toBeGreaterThanOrEqual(
      RealtimeTiming.keepAliveMs * 2
    )
  })

  test('builds separate connections for different hubs', () => {
    RealtimeConnections.acquire('/notifications')
    RealtimeConnections.acquire('/courses')

    expect(built).toHaveLength(2)
  })

  test('keeps the connection open while any subscriber remains', () => {
    RealtimeConnections.acquire('/notifications')
    RealtimeConnections.acquire('/notifications')

    RealtimeConnections.release('/notifications')
    vi.advanceTimersByTime(RealtimeConnections.IDLE_GRACE_MS * 2)

    expect(built[0].stop).not.toHaveBeenCalled()
  })

  test('closes the connection once the last subscriber leaves and the grace period passes', () => {
    RealtimeConnections.acquire('/notifications')
    RealtimeConnections.release('/notifications')

    expect(built[0].stop).not.toHaveBeenCalled()

    vi.advanceTimersByTime(RealtimeConnections.IDLE_GRACE_MS + 1)

    expect(built[0].stop).toHaveBeenCalledTimes(1)
  })

  // Navigating between two pages that use the same hub releases and re-acquires within one tick.
  // Tearing the socket down there would cost a reconnect, a token validation and a session lookup.
  test('reuses the same connection when re-acquired inside the grace period', () => {
    RealtimeConnections.acquire('/notifications')
    RealtimeConnections.release('/notifications')

    vi.advanceTimersByTime(RealtimeConnections.IDLE_GRACE_MS / 2)
    RealtimeConnections.acquire('/notifications')
    vi.advanceTimersByTime(RealtimeConnections.IDLE_GRACE_MS * 2)

    expect(built).toHaveLength(1)
    expect(built[0].stop).not.toHaveBeenCalled()
  })

  test('closes every connection on demand', async () => {
    RealtimeConnections.acquire('/notifications')
    RealtimeConnections.acquire('/courses')

    await RealtimeConnections.closeAll()

    expect(built[0].stop).toHaveBeenCalledTimes(1)
    expect(built[1].stop).toHaveBeenCalledTimes(1)
  })

  test('builds a fresh connection after everything was closed', async () => {
    RealtimeConnections.acquire('/notifications')
    await RealtimeConnections.closeAll()

    RealtimeConnections.acquire('/notifications')

    expect(built).toHaveLength(2)
  })

  test('ignores a release for a hub that was never acquired', () => {
    expect(() => RealtimeConnections.release('/nothing')).not.toThrow()
  })

  // A rejected start must not be cached, or a client that happened to be offline at mount would
  // stay disconnected for as long as the page is open.
  test('retries the start after a failed attempt instead of caching the rejection', async () => {
    pendingStartErrors.push(new Error('offline'))

    const first = RealtimeConnections.acquire('/notifications')
    await expect(first.started).rejects.toThrow('offline')

    const second = RealtimeConnections.acquire('/notifications')
    await expect(second.started).resolves.toBeUndefined()
    expect(built[0].start).toHaveBeenCalledTimes(2)
  })

  test('runs the connected hook once the hub is first usable', async () => {
    const onConnected = vi.fn()

    const { started } = RealtimeConnections.acquire('/collaboration', {
      onConnected
    })
    await started

    expect(onConnected).toHaveBeenCalledTimes(1)
  })

  // SignalR restores the socket but not what hung off it on the server — group membership above
  // all. Without this the page looks connected and silently receives nothing.
  test('runs the connected hook again after an automatic reconnect', async () => {
    const onConnected = vi.fn()

    const { started } = RealtimeConnections.acquire('/collaboration', {
      onConnected
    })
    await started

    built[0].simulateReconnected()

    expect(onConnected).toHaveBeenCalledTimes(2)
  })

  test('runs every subscriber’s hook, and stops running a released one', async () => {
    const first = vi.fn()
    const second = vi.fn()

    const a = RealtimeConnections.acquire('/collaboration', {
      onConnected: first
    })
    RealtimeConnections.acquire('/collaboration', { onConnected: second })
    await a.started

    built[0].simulateReconnected()
    expect(first).toHaveBeenCalledTimes(2)
    expect(second).toHaveBeenCalledTimes(2)

    a.release()
    built[0].simulateReconnected()

    expect(first).toHaveBeenCalledTimes(2)
    expect(second).toHaveBeenCalledTimes(3)
  })
})
