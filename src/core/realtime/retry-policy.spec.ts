import type { RetryContext } from '@microsoft/signalr'
import { describe, expect, test } from 'vitest'
import { JitteredRetryPolicy } from './retry-policy'

function contextFor(previousRetryCount: number): RetryContext {
  return {
    previousRetryCount,
    elapsedMilliseconds: 0,
    retryReason: new Error('disconnected')
  }
}

describe('JitteredRetryPolicy', () => {
  test('retries immediately on the first attempt', () => {
    const policy = new JitteredRetryPolicy()

    expect(policy.nextRetryDelayInMilliseconds(contextFor(0))).toBe(0)
  })

  test('never exceeds the exponential ceiling for the attempt', () => {
    const policy = new JitteredRetryPolicy(1000, 30_000)

    for (let attempt = 1; attempt <= 10; attempt++) {
      const ceiling = Math.min(1000 * 2 ** (attempt - 1), 30_000)

      for (let i = 0; i < 50; i++) {
        const delay = policy.nextRetryDelayInMilliseconds(contextFor(attempt))

        expect(delay).toBeGreaterThanOrEqual(0)
        expect(delay).toBeLessThanOrEqual(ceiling)
      }
    }
  })

  test('caps the delay so a long outage does not strand a client', () => {
    const policy = new JitteredRetryPolicy(1000, 5000)

    for (let i = 0; i < 100; i++) {
      expect(
        policy.nextRetryDelayInMilliseconds(contextFor(20))
      ).toBeLessThanOrEqual(5000)
    }
  })

  // The whole reason for this policy: SignalR's default schedule is identical on every client,
  // so a pod restart makes all its connections retry at the same instants.
  test('spreads retries rather than returning one fixed delay', () => {
    const policy = new JitteredRetryPolicy()

    const delays = new Set(
      Array.from({ length: 100 }, () =>
        policy.nextRetryDelayInMilliseconds(contextFor(5))
      )
    )

    expect(delays.size).toBeGreaterThan(1)
  })
})
