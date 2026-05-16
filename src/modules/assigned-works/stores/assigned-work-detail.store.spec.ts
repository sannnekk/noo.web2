import { createPinia, setActivePinia } from 'pinia'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock
} from 'vitest'
import type { AssignedWorkEntity } from '../api/assigned-work.types'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    currentRoute: { value: { name: 'r', params: {}, query: {}, hash: '' } },
    replace: vi.fn(),
    push: vi.fn()
  })
}))

vi.mock('../api/assigned-work.service', () => ({
  AssignedWorkService: {
    getById: vi.fn(),
    saveAnswer: vi.fn(),
    createAnswerDraft: vi.fn((task: { id: string; maxScore: number }) => ({
      _entityName: 'AssignedWorkAnswer',
      _key: `key-${task.id}`,
      _status: 'empty' as const,
      taskId: task.id,
      status: 'not-submitted',
      richTextContent: null,
      wordContent: null,
      mentorComment: null,
      detailedScore: null,
      score: null,
      maxScore: task.maxScore
    })),
    markSolved: vi.fn(),
    markChecked: vi.fn(),
    markUnsolved: vi.fn(),
    markUnchecked: vi.fn(),
    remake: vi.fn(),
    shiftDeadline: vi.fn(),
    addMentor: vi.fn()
  }
}))

import { AssignedWorkService } from '../api/assigned-work.service'
import { useAssignedWorkDetailStore } from './assigned-work-detail.store'

const AUTOSAVE_DEBOUNCE_MS = 1500

function makeAssignedWork(): AssignedWorkEntity {
  return {
    _entityName: 'AssignedWork',
    id: 'aw-1',
    title: 'Work',
    type: 'test',
    attempt: 1,
    solveStatus: 'not-solved',
    solveDeadlineAt: null,
    solvedAt: null,
    checkStatus: 'not-checked',
    checkDeadlineAt: null,
    checkedAt: null,
    statusHistory: [],
    score: null,
    maxScore: 10,
    isArchivedByStudent: false,
    isArchivedByMentors: false,
    isArchivedByAssistants: false,
    excludedTaskIds: [],
    studentCommentId: null,
    mainMentorCommentId: null,
    helperMentorCommentId: null,
    studentId: 'student-1',
    mainMentorId: null,
    helperMentorId: null,
    workId: 'w-1',
    work: {
      id: 'w-1',
      _entityName: 'Work',
      tasks: [
        { id: 't-1', maxScore: 5 },
        { id: 't-2', maxScore: 5 }
      ]
    } as unknown as AssignedWorkEntity['work'],
    answers: []
  } as unknown as AssignedWorkEntity
}

function mockSaveAnswerOk() {
  let counter = 0
  ;(AssignedWorkService.saveAnswer as Mock).mockImplementation(async () => {
    counter += 1
    return { data: { id: `saved-${counter}` } }
  })
}

async function flushTimers() {
  await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS + 50)
  // allow chained microtasks (saveAnswer promise + serialization) to settle
  await vi.runAllTimersAsync()
}

describe('useAssignedWorkDetailStore — autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: makeAssignedWork()
    })
    mockSaveAnswerOk()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('autosaves a single combined request after debounce when in solve mode', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    store.updateAnswer('t-1', { wordContent: 'a' })
    store.updateAnswer('t-1', { wordContent: 'ab' })
    store.updateAnswer('t-1', { wordContent: 'abc' })

    // Before the debounce expires nothing is sent.
    expect(AssignedWorkService.saveAnswer).not.toHaveBeenCalled()

    await flushTimers()

    // All three updates collapse into ONE save (debouncing).
    expect(AssignedWorkService.saveAnswer).toHaveBeenCalledTimes(1)

    const payload = (AssignedWorkService.saveAnswer as Mock).mock.calls[0][1]

    expect(payload.taskId).toBe('t-1')
    expect(payload.wordContent).toBe('abc')

    // saveStatus reflects success
    expect(store.saveStatus.isLoading).toBe(false)
    expect(store.saveStatus.lastSavedAt).toBeInstanceOf(Date)
    expect(store.saveStatus.hasError).toBe(false)

    // The saved answer is marked as saved
    expect(store.answers['t-1']._status).toBe('saved')
    expect(store.answers['t-1'].id).toBe('saved-1')
  })

  test('does not autosave when viewMode is "read"', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('read')

    store.updateAnswer('t-1', { wordContent: 'should-not-save' })

    await flushTimers()

    expect(AssignedWorkService.saveAnswer).not.toHaveBeenCalled()
    expect(store.isAutosaveEnabled).toBe(false)
  })

  test('autosaves in "check" mode too', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('check')

    store.updateAnswer('t-1', { score: 4 })

    await flushTimers()

    expect(AssignedWorkService.saveAnswer).toHaveBeenCalledTimes(1)
  })

  test('does not autosave on init alone (no user edits)', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    await flushTimers()

    expect(AssignedWorkService.saveAnswer).not.toHaveBeenCalled()
  })

  test('switching to read mode while a debounce is pending cancels the autosave', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    store.updateAnswer('t-1', { wordContent: 'editing' })
    // Mid-debounce, user navigates back to read mode
    store.setMode('read')

    await flushTimers()

    expect(AssignedWorkService.saveAnswer).not.toHaveBeenCalled()
  })

  test('marks hasError and leaves answers dirty when the API call fails', async () => {
    ;(AssignedWorkService.saveAnswer as Mock).mockResolvedValueOnce({
      error: { id: 'BOOM', statusCode: 500, name: 'err', payload: null }
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    store.updateAnswer('t-1', { wordContent: 'x' })

    await flushTimers()

    expect(store.saveStatus.hasError).toBe(true)
    expect(store.saveStatus.isLoading).toBe(false)
    expect(store.answers['t-1']._status).toBe('modified')
  })

  test('serializes manual save during in-flight autosave', async () => {
    const order: string[] = []
    let resolveFirst: ((v: unknown) => void) | null = null
    let callIdx = 0

    ;(AssignedWorkService.saveAnswer as Mock).mockImplementation(async () => {
      callIdx += 1
      const idx = callIdx
      order.push(`start-${idx}`)
      if (idx === 1) {
        await new Promise((resolve) => {
          resolveFirst = resolve
        })
      }
      order.push(`end-${idx}`)
      return { data: { id: `saved-${idx}` } }
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    // First user edit kicks off autosave via debounce
    store.updateAnswer('t-1', { wordContent: 'first' })
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS + 10)

    // Autosave has started but is pending (resolveFirst not yet called)
    expect(order).toEqual(['start-1'])

    // While the first save is in-flight, user edits another answer and
    // triggers manual save (e.g. clicks the "Save" button).
    store.updateAnswer('t-2', { wordContent: 'second' })
    const manualSavePromise = store.save()

    // The manual save must wait for the first request to finish — no
    // overlapping calls.
    await vi.advanceTimersByTimeAsync(50)
    expect(order).toEqual(['start-1'])

    // Let the first save complete
    resolveFirst!(undefined)
    await vi.runAllTimersAsync()
    await manualSavePromise

    expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
    expect(AssignedWorkService.saveAnswer).toHaveBeenCalledTimes(2)
  })

  test('reset clears save status and inflight saves do not affect a new session', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    store.updateAnswer('t-1', { wordContent: 'x' })
    await flushTimers()

    expect(store.saveStatus.lastSavedAt).toBeInstanceOf(Date)

    store.reset()

    expect(store.saveStatus.lastSavedAt).toBeNull()
    expect(store.saveStatus.isLoading).toBe(false)
    expect(store.assignedWork).toBeUndefined()
    expect(store.answers).toEqual({})
  })

  test('manual save with no user edits does not call the API', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    // Pristine drafts have `_status: 'empty'` and should not be flushed.
    await store.save()

    expect(AssignedWorkService.saveAnswer).not.toHaveBeenCalled()
  })
})
