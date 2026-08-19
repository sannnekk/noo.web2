// assigned-work.service.test.ts
import { Api, isApiError } from '@/core/api/api.utils'
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
vi.mock('@/core/api/api.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/api/api.utils')>()

  return {
    ...actual,
    Api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    }
  }
})

describe('AssignedWorkService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('should fetch assigned works with pagination', async () => {
      const query = new URLSearchParams()
      query.append('page', '1')
      query.append('perPage', '10')

      const mockPagination: IPagination = {
        page: 1,
        pageSize: 10,
        toQuery: () => query
      }
      const mockData = [{ id: '1' }]

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await AssignedWorkService.get(mockPagination)

      expect(Api.get).toHaveBeenCalledWith(
        '/assigned-work',
        expect.any(URLSearchParams)
      )

      const params = (Api.get as Mock).mock.calls[0]?.[1] as URLSearchParams

      expect(params.get('page')).toBe('1')
      expect(params.get('perPage')).toBe('10')
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })

    test('should handle error response', async () => {
      const mockError = { error: { id: 'ERROR', statusCode: 500 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await AssignedWorkService.get()

      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })
  })

  describe('getById', () => {
    test('should fetch assigned work by ID', async () => {
      const mockId = '123'
      const mockData = { id: mockId }

      ;(Api.get as Mock).mockResolvedValue({ data: mockData })

      const result = await AssignedWorkService.getById(mockId)

      expect(Api.get).toHaveBeenCalledWith(
        `/assigned-work/${mockId}`,
        undefined,
        undefined,
        undefined
      )
      expect(!isApiError(result) && result.data).toEqual(mockData)
    })

    test('should pass the progress callback through to the request', async () => {
      const onProgress = vi.fn()

      ;(Api.get as Mock).mockResolvedValue({ data: { id: '123' } })

      await AssignedWorkService.getById('123', onProgress)

      expect(Api.get).toHaveBeenCalledWith(
        '/assigned-work/123',
        undefined,
        undefined,
        onProgress
      )
    })
  })

  describe('getProgress', () => {
    test('should fetch progress by ID', async () => {
      const mockId = '123'
      const mockProgress = [{ solveStatus: 'solved-in-deadline' }]

      ;(Api.get as Mock).mockResolvedValue({ data: mockProgress })

      const result = await AssignedWorkService.getProgress(mockId)

      expect(Api.get).toHaveBeenCalledWith(`/assigned-work/${mockId}/progress`)
      expect(!isApiError(result) && result.data).toEqual(mockProgress)
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
      expect(!isApiError(result) && result.data).toEqual({ id: 'new-id' })
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
      expect(!isApiError(result) && result.data).toEqual({ id: 'answer-id' })
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
        content: null
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
      expect(!isApiError(result) && result.data).toEqual({ id: 'comment-id' })
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

  describe('getTaskAnswerKey', () => {
    test('asks the work for one task answer key', async () => {
      ;(Api.get as Mock).mockResolvedValue({
        data: { taskId: 't1', rightAnswers: ['a'] }
      })

      const result = await AssignedWorkService.getTaskAnswerKey('aw1', 't1')

      expect(Api.get).toHaveBeenCalledWith(
        '/assigned-work/aw1/task/t1/answer-key'
      )
      expect(!isApiError(result) && result.data).toEqual({
        taskId: 't1',
        rightAnswers: ['a']
      })
    })
  })

  describe('checkTask', () => {
    test('posts to the one-task check endpoint', async () => {
      const verdict = {
        taskId: 't1',
        answerId: 'a1',
        score: 5,
        maxScore: 5,
        isCorrect: true
      }

      ;(Api.post as Mock).mockResolvedValue({ data: verdict })

      const result = await AssignedWorkService.checkTask('aw1', 't1')

      expect(Api.post).toHaveBeenCalledWith('/assigned-work/aw1/task/t1/check')
      expect(!isApiError(result) && result.data).toEqual(verdict)
    })
  })
})
