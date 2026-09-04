import mitt from 'mitt'

export interface GlobalEvents {
  'auth:login': void
  'auth:login-expired': void
  'auth:logout': void
  /** The personal hub is up; anything that falls back to polling can stand down. */
  'realtime:connected': void
  /** The personal hub is down; fallbacks should take over until it returns. */
  'realtime:disconnected': void
}

class GlobalEventBusClass {
  private eventEmitter = mitt<GlobalEvents & Record<string | symbol, unknown>>()

  public emit<T extends keyof GlobalEvents>(
    event: T,
    payload: GlobalEvents[T]
  ): void {
    this.eventEmitter.emit(event, payload)
  }

  public on<T extends keyof GlobalEvents>(
    event: T,
    callback: (payload: GlobalEvents[T]) => void
  ): void {
    this.eventEmitter.on(event, callback)
  }

  public off<T extends keyof GlobalEvents>(
    event: T,
    callback: (payload: GlobalEvents[T]) => void
  ): void {
    this.eventEmitter.off(event, callback)
  }
}

export const GlobalEventBus = new GlobalEventBusClass()
