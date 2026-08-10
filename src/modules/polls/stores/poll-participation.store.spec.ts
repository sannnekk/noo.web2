import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { PollEntity } from '../api/poll.types'

vi.mock('../api/poll.service', () => ({
  PollService: {
    getById: vi.fn(),
    participate: vi.fn()
  }
}))

vi.mock('@/core/stores/auth.store', () => ({
  useAuthStore: () => ({ userId: 'user-1' })
}))

vi.mock('@/core/stores/global-ui.store', () => ({
  useGlobalUIStore: () => ({
    createWarningToast: vi.fn(),
    createApiErrorToast: vi.fn(),
    createSuccessToast: vi.fn()
  })
}))

import { PollService } from '../api/poll.service'
import { usePollParticipationStore } from './poll-participation.store'

const createdAt = new Date('2020-01-01')

function makePoll(overrides: Partial<PollEntity> = {}): PollEntity {
  return {
    _entityName: 'Poll',
    id: 'poll-1',
    createdAt,
    updatedAt: null,
    title: 'Poll',
    description: null,
    isActive: true,
    expiresAt: null,
    isAuthRequired: false,
    participationsCount: 0,
    hasParticipated: false,
    questions: [
      {
        _entityName: 'PollQuestion',
        id: 'question-1',
        createdAt,
        updatedAt: null,
        order: 1,
        title: 'Question',
        description: null,
        isRequired: false,
        type: 'text',
        config: {}
      }
    ],
    ...overrides
  }
}

function mockPoll(poll: PollEntity): void {
  vi.mocked(PollService.getById).mockResolvedValue({ data: poll })
}

describe('poll participation store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('lets a user who has not answered the poll take it', async () => {
    mockPoll(makePoll())

    const store = usePollParticipationStore()
    await store.init('poll-1')

    expect(store.hasParticipated).toBe(false)
    expect(store.isAvailable).toBe(true)
    expect(store.unavailabilityReason).toBeNull()
  })

  test('keeps a user who already answered the poll out of it', async () => {
    mockPoll(makePoll({ hasParticipated: true }))

    const store = usePollParticipationStore()
    await store.init('poll-1')

    expect(store.hasParticipated).toBe(true)
    expect(store.isAvailable).toBe(false)
    expect(store.unavailabilityReason).toContain('уже проходили')
  })

  test('reports the repeat participation rather than the expiry', async () => {
    mockPoll(
      makePoll({ hasParticipated: true, expiresAt: new Date('2020-01-01') })
    )

    const store = usePollParticipationStore()
    await store.init('poll-1')

    expect(store.unavailabilityReason).toContain('уже проходили')
  })

  test('closes the poll when the API turns the answers away as a repeat', async () => {
    mockPoll(makePoll())
    vi.mocked(PollService.participate).mockResolvedValue({
      error: {
        id: 'USER_ALREADY_VOTED',
        statusCode: 400,
        name: 'Вы уже проголосовали',
        payload: null
      }
    })

    const store = usePollParticipationStore()
    await store.init('poll-1')
    store.setParticipant({ userType: 'authenticated-user' })

    await expect(store.submit()).resolves.toBe(false)

    expect(store.hasParticipated).toBe(true)
    expect(store.isAvailable).toBe(false)
    expect(store.isSubmitted).toBe(false)
  })

  test('does not send the answers of a poll that is already answered', async () => {
    mockPoll(makePoll({ hasParticipated: true }))

    const store = usePollParticipationStore()
    await store.init('poll-1')
    store.setParticipant({ userType: 'authenticated-user' })

    await expect(store.submit()).resolves.toBe(false)

    expect(PollService.participate).not.toHaveBeenCalled()
  })
})
