import { Api } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import type { PossiblyUnsavedWork } from '../types'
import { WorkService } from './work.service'
import type { WorkEntity, WorkStatistics } from './work.types'

vi.mock('@/core/api/api.utils', () => ({
  Api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('WorkService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('should fetch works with pagination', async () => {
      const query = new URLSearchParams()
      query.append('page', '1')
      query.append('perPage', '10')

      const mockPagination: IPagination = {
        page: 1,
        pageSize: 10,
        toQuery: () => query
      }
      const mockData = [{ id: 'w1' } as WorkEntity]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await WorkService.get(mockPagination)

      expect(Api.get).toHaveBeenCalledWith('/work', expect.any(URLSearchParams))

      const params = (Api.get as Mock).mock.calls[0]?.[1] as URLSearchParams

      expect(params.get('page')).toBe('1')
      expect(params.get('perPage')).toBe('10')
      expect(result.data).toEqual(mockData)
    })

    test('should fetch works without pagination', async () => {
      const mockData = [{ id: 'w1' } as WorkEntity]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await WorkService.get()

      expect(Api.get).toHaveBeenCalledWith('/work', undefined)
      expect(result.data).toEqual(mockData)
    })

    test('should return error response', async () => {
      const mockError = { error: { id: 'ERR', statusCode: 500 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await WorkService.get()

      expect(result.error).toEqual(mockError.error)
    })
  })

  describe('getById', () => {
    test('should fetch work by id', async () => {
      const mockId = 'w1'
      const mockData = { id: mockId } as WorkEntity

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await WorkService.getById(mockId)

      expect(Api.get).toHaveBeenCalledWith(`/work/${mockId}`)
      expect(result.data).toEqual(mockData)
    })

    test('should handle error response', async () => {
      const mockId = 'w1'
      const mockError = { error: { id: 'NOT_FOUND', statusCode: 404 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await WorkService.getById(mockId)

      expect(result.error).toEqual(mockError.error)
    })
  })

  describe('getStatisticsById', () => {
    test('should fetch work statistics by id', async () => {
      const mockId = 'w1'
      const mockWork: WorkEntity = {
        _entityName: 'Work',
        id: mockId,
        createdAt: new Date(),
        updatedAt: null,
        title: 'Work title',
        type: 'test',
        description: null,
        subjectId: 'subject-1'
      }
      const mockStats: WorkStatistics = {
        hardestTaskSummaries: [],
        averageWorkScore: null,
        medianWorkScore: null,
        workSolveCount: 0,
        work: mockWork
      }

      ;(Api.get as Mock).mockResolvedValue({ data: mockStats })

      const result = await WorkService.getStatisticsById(mockId)

      expect(Api.get).toHaveBeenCalledWith(`/work/${mockId}/statistics`)
      expect(result.data).toEqual(mockStats)
    })

    test('should handle statistics error response', async () => {
      const mockId = 'w1'
      const mockError = { error: { id: 'ERR', statusCode: 500 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await WorkService.getStatisticsById(mockId)

      expect(result.error).toEqual(mockError.error)
    })
  })

  describe('create', () => {
    test('should create a work', async () => {
      const payload: PossiblyUnsavedWork = {
        _key: 'temp-key',
        _entityName: 'Work',
        title: 'New Work',
        type: 'test',
        description: null,
        subjectId: null,
        tasks: []
      }
      const mockResponse = { id: 'new-work-id' }

      ;(Api.post as Mock).mockResolvedValue({ data: mockResponse })

      const result = await WorkService.create(payload)

      expect(Api.post).toHaveBeenCalledWith('/work', payload)
      expect(result.data).toEqual(mockResponse)
    })
  })

  describe('update', () => {
    test('should update a work', async () => {
      const mockId = 'w1'
      const patch = [{ op: 'replace', path: '/name', value: 'Updated' }]

      ;(Api.patch as Mock).mockResolvedValue({})

      await WorkService.update(mockId, patch as any)

      expect(Api.patch).toHaveBeenCalledWith(`/work/${mockId}`, patch)
    })
  })

  describe('delete', () => {
    test('should delete a work', async () => {
      const mockId = 'w1'

      ;(Api.delete as Mock).mockResolvedValue({})

      await WorkService.delete(mockId)

      expect(Api.delete).toHaveBeenCalledWith(`/work/${mockId}`)
    })
  })
})
