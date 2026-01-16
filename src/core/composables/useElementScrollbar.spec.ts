import { describe, expect, test, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useElementScrollbar } from './useElementScrollbar'

const listeners: Array<() => void> = []

vi.mock('@vueuse/core', () => ({
  useEventListener: (_target: unknown, _event: string, handler: () => void) => {
    listeners.push(handler)
  },
  useResizeObserver: (_target: unknown, handler: () => void) => {
    listeners.push(handler)
  }
}))

describe('useElementScrollbar', () => {
  test('updates scrollability states', async () => {
    const element = {
      scrollTop: 0,
      clientHeight: 100,
      scrollHeight: 300
    } as HTMLElement

    const elementRef = ref<HTMLElement | null>(element)
    const { scrollableToTop, scrollableToBottom } =
      useElementScrollbar(elementRef)

    await nextTick()

    listeners.forEach((handler) => handler())

    expect(scrollableToTop.value).toBe(false)
    expect(scrollableToBottom.value).toBe(true)

    element.scrollTop = 150
    listeners.forEach((handler) => handler())

    expect(scrollableToTop.value).toBe(true)
    expect(scrollableToBottom.value).toBe(true)

    element.scrollTop = 220
    listeners.forEach((handler) => handler())

    expect(scrollableToBottom.value).toBe(false)
  })

  test('handles null element', async () => {
    const elementRef = ref<HTMLElement | null>(null)
    const { scrollableToTop, scrollableToBottom } =
      useElementScrollbar(elementRef)

    await nextTick()

    listeners.forEach((handler) => handler())

    expect(scrollableToTop.value).toBe(false)
    expect(scrollableToBottom.value).toBe(false)
  })
})
