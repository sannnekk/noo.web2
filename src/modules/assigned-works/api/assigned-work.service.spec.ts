// assigned-work.service.test.ts
import { Api } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { AssignedWorkService } from './assigned-work.service'
import type {
  AddHelperMentorOptions,
  AssignedWorkRemakeOptions,
  ShiftAssignedWorkDeadlineOptions,
  UpsertAssignedWorkAnswerDto,
  UpsertAssignedWorkCommentDto
} from './assigned-work.types'

// Mock the entire API module
vi.mock('@/core/api/api.utils', () => ({
  Api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('AssignedWorkService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('should fetch assigned works with pagination', async () => {
      const mockPagination: IPagination = {
        page: 1,
        pageSize: 10,
        toQuery: () => ({ page: '1', pageSize: '10' })
      }
      const mockData = [{ id: '1' }]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await AssignedWorkService.get(mockPagination)

      expect(Api.get).toHaveBeenCalledWith('/assigned-work', {
        page: '1',
        pageSize: '10'
      })
      expect(result.data).toEqual(mockData)
    })

    test('should handle error response', async () => {
      const mockError = { error: { id: 'ERROR', statusCode: 500 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await AssignedWorkService.get()

      expect(result.error).toEqual(mockError.error)
    })
  })

  describe('getById', () => {
    test('should fetch assigned work by ID', async () => {
      const mockId = '123'
      const mockData = { id: mockId }

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await AssignedWorkService.getById(mockId)

      expect(Api.get).toHaveBeenCalledWith(`/assigned-work/${mockId}`)
      expect(result.data).toEqual(mockData)
    })
  })

  describe('getProgress', () => {
    test('should fetch progress by ID', async () => {
      const mockId = '123'
      const mockProgress = { solveStatus: 'solved' }

      ;(Api.get as Mock).mockResolvedValue({ data: mockProgress })

      const result = await AssignedWorkService.getProgress(mockId)

      expect(Api.get).toHaveBeenCalledWith(`/assigned-work/${mockId}/progress`)
      expect(result.data).toEqual(mockProgress)
    })
  })

  describe('remake', () => {
    test('should create remake with options', async () => {
      const mockId = '123'
      const mockOptions: AssignedWorkRemakeOptions = {
        includeOnlyWrongTasks: true
      }

      ;(Api.post as Mock).mockResolvedValue({ data: { id: 'new-id' } })

      const result = await AssignedWorkService.remake(mockId, mockOptions)

      expect(Api.post).toHaveBeenCalledWith(
        `/assigned-work/${mockId}/remake`,
        mockOptions
      )
      expect(result.data).toEqual({ id: 'new-id' })
    })
  })

  describe('markSolved', () => {
    test('should call mark-solved endpoint', async () => {
      const mockId = '123'

      ;(Api.post as Mock).mockResolvedValue({})

      await AssignedWorkService.markSolved(mockId)
      expect(Api.post).toHaveBeenCalledWith(
        `/assigned-work/${mockId}/mark-solved`
      )
    })
  })

  describe('saveAnswer', () => {
    test('should post answer to save-answer endpoint', async () => {
      const mockAssignedWorkId = 'aw1'
      const payload: UpsertAssignedWorkAnswerDto = {
        id: 'a1',
        taskId: 't1',
        status: 'not-submitted',
        wordContent: null,
        score: null,
        detailedScore: null,
        maxScore: 10
      }

      ;(Api.post as Mock).mockResolvedValue({ data: { id: 'answer-id' } })

      const result = await AssignedWorkService.saveAnswer(
        mockAssignedWorkId,
        payload
      )

      expect(Api.post).toHaveBeenCalledWith(
        `/assigned-work/${mockAssignedWorkId}/save-answer`,
        payload
      )
      expect(result.data).toEqual({ id: 'answer-id' })
    })
  })

  describe('addMentor', () => {
    test('should patch mentors endpoint with options', async () => {
      const mockId = '123'
      const mockMentorId = 'm1'
      const mockOptions: AddHelperMentorOptions = {
        mentorId: mockMentorId
      }

      ;(Api.patch as Mock).mockResolvedValue({})

      await AssignedWorkService.addMentor(mockId, mockOptions)
      expect(Api.patch).toHaveBeenCalledWith(
        `/assigned-work/${mockId}/add-helper-mentor`,
        mockOptions
      )
    })
  })

  describe('delete', () => {
    test('should call delete endpoint', async () => {
      const mockId = '123'

      ;(Api.delete as Mock).mockResolvedValue({})

      await AssignedWorkService.delete(mockId)
      expect(Api.delete).toHaveBeenCalledWith(`/assigned-work/${mockId}`)
    })
  })

  // Additional tests for other methods following the same pattern
  describe('markChecked', () => {
    test('should call mark-checked endpoint', async () => {
      const mockId = '123'

      ;(Api.post as Mock).mockResolvedValue({})

      await AssignedWorkService.markChecked(mockId)
      expect(Api.post).toHaveBeenCalledWith(
        `/assigned-work/${mockId}/mark-checked`
      )
    })
  })

  describe('saveComment', () => {
    test('should post comment to comment endpoint', async () => {
      const mockAssignedWorkId = 'aw1'
      const payload: UpsertAssignedWorkCommentDto = {
        id: 'c1'
      }

      ;(Api.post as Mock).mockResolvedValue({ data: { id: 'comment-id' } })

      const result = await AssignedWorkService.saveComment(
        mockAssignedWorkId,
        payload
      )

      expect(Api.post).toHaveBeenCalledWith(
        `/assigned-work/${mockAssignedWorkId}/comment`,
        payload
      )
      expect(result.data).toEqual({ id: 'comment-id' })
    })
  })

  describe('shiftDeadline', () => {
    test('should call shift-deadline endpoint', async () => {
      const mockId = '123'
      const options: ShiftAssignedWorkDeadlineOptions = {
        newDeadline: new Date('2025-01-01T00:00:00.000Z'),
        notifyOthers: true
      }

      ;(Api.patch as Mock).mockResolvedValue({})

      await AssignedWorkService.shiftDeadline(mockId, options)
      expect(Api.patch).toHaveBeenCalledWith(
        `/assigned-work/${mockId}/shift-deadline`,
        options
      )
    })
  })
})
