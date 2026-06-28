import { Api, isApiError } from '@/core/api/api.utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { PollService } from './poll.service'

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

describe('PollService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('draft factories', () => {
    test('createDraft should create default poll draft', () => {
      const draft = PollService.createDraft()

      expect(draft).toMatchObject({
        _entityName: 'Poll',
        title: 'Новый опрос',
        description: null,
        isActive: true,
        expiresAt: null,
        isAuthRequired: false,
        questions: []
      })
      expect(draft._key).toEqual(expect.any(String))
    })

    test('createQuestionDraft should create default question draft', () => {
      const draft = PollService.createQuestionDraft()

      expect(draft).toMatchObject({
        _entityName: 'PollQuestion',
        title: 'Новый вопрос',
        description: null,
        type: 'text',
        isRequired: false,
        config: {}
      })
      expect(draft._key).toEqual(expect.any(String))
    })
  })

  describe('create', () => {
    test('should post poll payload', async () => {
      const payload = PollService.createDraft()
      const created = { id: 'poll-1' }

      ;(Api.post as Mock).mockResolvedValue({ data: created })

      const result = await PollService.create(payload)

      expect(Api.post).toHaveBeenCalledWith('/poll', payload)
      expect(!isApiError(result) && result.data).toEqual(created)
    })
  })

  describe('participations', () => {
    test('getParticipations should request the poll participation endpoint', async () => {
      ;(Api.get as Mock).mockResolvedValue({ data: [] })

      await PollService.getParticipations('poll-1')

      expect(Api.get).toHaveBeenCalledWith(
        '/poll/poll-1/participation',
        undefined
      )
    })

    test('getParticipation should request a single participation', async () => {
      ;(Api.get as Mock).mockResolvedValue({ data: { id: 'part-1' } })

      await PollService.getParticipation('part-1')

      expect(Api.get).toHaveBeenCalledWith('/poll/participation/part-1')
    })

    test('getParticipatedPolls should request the user participation endpoint', async () => {
      ;(Api.get as Mock).mockResolvedValue({ data: [] })

      await PollService.getParticipatedPolls('user-1')

      expect(Api.get).toHaveBeenCalledWith(
        '/poll/user/user-1/participation',
        undefined
      )
    })
  })
})
