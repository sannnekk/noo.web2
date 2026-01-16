import { describe, expect, test, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { usePageUrl } from './usePageUrl'

const routeState = reactive({ path: '/initial' })

vi.mock('vue-router', () => ({
  useRoute: () => routeState
}))

describe('usePageUrl', () => {
  test('builds current page url from route', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true
    })

    routeState.path = '/test-page'

    const { currentPageUrl } = usePageUrl()

    expect(currentPageUrl.value).toBe('https://example.com/test-page')
  })

  test('reacts to route path changes', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true
    })

    const { currentPageUrl } = usePageUrl()

    routeState.path = '/next'
    await nextTick()

    expect(currentPageUrl.value).toBe('https://example.com/next')
  })
})
