import { GlobalEventBus } from '@/core/events/event-bus'
import { describe, expect, test, vi } from 'vitest'
import { useGlobalEventBus } from './useGlobalEventBus'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')

  return {
    ...actual,
    onMounted: (fn: () => void) => fn(),
    onBeforeUnmount: (fn: () => void) => fn()
  }
})

describe('useGlobalEventBus', () => {
  test('registers and unregisters event listeners', () => {
    const onSpy = vi.spyOn(GlobalEventBus, 'on')
    const offSpy = vi.spyOn(GlobalEventBus, 'off')
    const callback = vi.fn()

    useGlobalEventBus('auth:login', callback)

    expect(onSpy).toHaveBeenCalledWith('auth:login', callback)
    expect(offSpy).toHaveBeenCalledWith('auth:login', callback)
  })
})
