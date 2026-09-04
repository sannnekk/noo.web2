import type { IRetryPolicy, RetryContext } from '@microsoft/signalr'

/**
 * Backoff for reconnects, with jitter.
 *
 * SignalR's default schedule (`[0, 2000, 10000, 30000]`) is fixed and identical on every client,
 * so losing a pod makes every connection it held retry in lockstep — the surviving pods then get
 * the whole burst at the same instants. Jitter spreads it; the cap keeps a client that was
 * offline for a while from waiting minutes after the network returns.
 */
export class JitteredRetryPolicy implements IRetryPolicy {
  private readonly baseDelayMs: number
  private readonly maxDelayMs: number

  constructor(baseDelayMs = 1000, maxDelayMs = 30_000) {
    this.baseDelayMs = baseDelayMs
    this.maxDelayMs = maxDelayMs
  }

  public nextRetryDelayInMilliseconds(retryContext: RetryContext): number {
    // First attempt is immediate: most disconnects are a blip, and reconnecting at once hides
    // them entirely.
    if (retryContext.previousRetryCount === 0) {
      return 0
    }

    const exponential = Math.min(
      this.baseDelayMs * 2 ** (retryContext.previousRetryCount - 1),
      this.maxDelayMs
    )

    // Full jitter: anywhere in [0, exponential]. Spreads a fleet-wide reconnect far better than
    // jittering around the delay does.
    return Math.round(Math.random() * exponential)
  }
}
