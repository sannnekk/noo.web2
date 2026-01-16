import type { ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { describe, expect, test, vi, type Mock } from 'vitest'
import { useSearch } from './useSearch'

vi.mock('@vueuse/core', () => ({
  debouncedWatch: (_sources: unknown, cb: () => void, options: any) => {
    if (options?.immediate) {
      cb()
    }
  }
}))

describe('useSearch', () => {
  test('runs search and exposes data', async () => {
    const searchFn = vi.fn(async () => ({
      data: [{ id: '1' }],
      meta: { total: 5 },
      error: null
    }))

    const search = useSearch(searchFn, { immediate: true, debounce: 0 })

    await Promise.resolve()

    expect(searchFn).toHaveBeenCalled()
    expect(search.data.value).toEqual([{ id: '1' }])
    expect(search.total.value).toBe(5)
  })

  test('combines filters with initial filters', async () => {
    const searchFn = vi.fn(
      async (_pagination?: IPagination): Promise<ApiResponse<unknown[]>> => ({
        data: [],
        meta: { total: 0 },
        error: null
      })
    )

    const search = useSearch(searchFn, {
      immediate: false,
      initialFilters: [new EqualsFilter('type', 'test')]
    })

    search.filters.value = [new EqualsFilter('status', 'active')]

    await search.reload()

    expect(searchFn).toHaveBeenCalled()

    const call = (searchFn as Mock).mock.calls[0]

    if (!call) {
      throw new Error('search function not called')
    }

    const pagination = call[0] as { toQuery: () => URLSearchParams }
    const params = pagination.toQuery()

    expect(params.get('type')).toBe('test')
    expect(params.get('status')).toBe('active')
  })

  test('does not run when immediate is false', async () => {
    const searchFn = vi.fn(
      async (_pagination?: IPagination): Promise<ApiResponse<unknown[]>> => ({
        data: [],
        meta: { total: 0 },
        error: null
      })
    )

    useSearch(searchFn, { immediate: false, debounce: 0 })

    await Promise.resolve()

    expect(searchFn).not.toHaveBeenCalled()
  })

  test('prefers runtime filters over initial filters with same key', async () => {
    const searchFn = vi.fn(
      async (_pagination?: IPagination): Promise<ApiResponse<unknown[]>> => ({
        data: [],
        meta: { total: 0 },
        error: null
      })
    )

    const search = useSearch(searchFn, {
      immediate: false,
      initialFilters: [new EqualsFilter('status', 'initial')]
    })

    search.filters.value = [new EqualsFilter('status', 'override')]

    await search.reload()

    const call = (searchFn as Mock).mock.calls[0]

    if (!call) {
      throw new Error('search function not called')
    }

    const pagination = call[0] as { toQuery: () => URLSearchParams }
    const params = pagination.toQuery()

    expect(params.get('status')).toBe('override')
  })

  test('exposes error response', async () => {
    const searchFn = vi.fn(
      async (): Promise<ApiResponse<unknown[]>> => ({
        data: null,
        meta: null,
        error: { id: 'ERR', statusCode: 500, name: 'Error', payload: null }
      })
    )

    const search = useSearch(searchFn, { immediate: true, debounce: 0 })

    await Promise.resolve()

    expect(search.error.value?.id).toBe('ERR')
    expect(search.data.value).toEqual([])
  })
})
