import { Api, isApiError } from '@/core/api/api.utils'
import { Pagination, EqualsFilter } from '@/core/utils/pagination.utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { UserHistoryService } from './user-history.service'
import type { UserHistoryEntity } from './user-history.types'

vi.mock('@/core/api/api.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/api/api.utils')>()

  return {
    ...actual,
    Api: {
      get: vi.fn()
    }
  }
})

const userId = 'user-1'

function makeEntry(): UserHistoryEntity {
  return {
    _entityName: 'UserHistory',
    id: 'entry-1',
    createdAt: new Date('2026-08-08'),
    updatedAt: null,
    type: 'added-to-course',
    subjectUserId: userId,
    actorUserId: 'admin-1',
    payload: { courseId: 'course-1', courseName: 'Физика ЕГЭ' },
    actor: null
  }
}

describe('UserHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('should fetch the history of a user', async () => {
      const entries = [makeEntry()]

      ;(Api.get as Mock).mockResolvedValue({ data: entries })

      const result = await UserHistoryService.get(userId)

      expect(Api.get).toHaveBeenCalledWith(`/user/${userId}/history`, undefined)
      expect(!isApiError(result) && result.data).toEqual(entries)
    })

    test('should pass pagination and the perspective filter as query params', async () => {
      ;(Api.get as Mock).mockResolvedValue({ data: [] })

      const pagination = new Pagination(2, 25, undefined, 'Descending', [
        new EqualsFilter('perspective', 'actor')
      ])

      await UserHistoryService.get(userId, pagination)

      const query = (Api.get as Mock).mock.calls[0][1] as URLSearchParams

      expect(query.get('page')).toBe('2')
      expect(query.get('perPage')).toBe('25')
      expect(query.get('perspective')).toBe('actor')
    })

    test('should handle error response', async () => {
      const mockError = { error: { id: 'ERROR', statusCode: 403 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await UserHistoryService.get(userId)

      expect(isApiError(result)).toBe(true)
    })
  })
})
