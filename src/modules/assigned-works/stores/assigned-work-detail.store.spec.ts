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
import type { IRichText } from '@/core/utils/richtext.utils'
import { computed, watchEffect } from 'vue'
import type { AssignedWorkEntity } from '../api/assigned-work.types'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    currentRoute: { value: { name: 'r', params: {}, query: {}, hash: '' } },
    replace: vi.fn(),
    push: vi.fn()
  })
}))

const principal = { value: null as { id: string; role: string } | null }

vi.mock('@/core/permissions/principal', () => ({
  getPrincipal: () => principal.value
}))

vi.mock('../api/assigned-work.service', () => ({
  AssignedWorkService: {
    getById: vi.fn(),
    saveAnswer: vi.fn(),
    saveComment: vi.fn(),
    markSolved: vi.fn(),
    markChecked: vi.fn(),
    markUnsolved: vi.fn(),
    markUnchecked: vi.fn(),
    remake: vi.fn(),
    shiftDeadline: vi.fn(),
    getTaskAnswerKey: vi.fn(),
    checkTask: vi.fn(),
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

function makeRichText(text: string): IRichText {
  return {
    $type: 'tiptap',
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
  }
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

function mockSaveCommentOk() {
  ;(AssignedWorkService.saveComment as Mock).mockResolvedValue({
    data: { id: 'comment-1' }
  })
}

describe('useAssignedWorkDetailStore — autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    principal.value = { id: 'student-1', role: 'student' }
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: makeAssignedWork()
    })
    mockSaveAnswerOk()
    mockSaveCommentOk()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    principal.value = null
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
    expect(AssignedWorkService.saveComment).not.toHaveBeenCalled()
  })

  test('autosaves the work comment alongside the answers', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    store.updateComment(makeRichText('half'))
    store.updateComment(makeRichText('whole'))

    expect(store.hasUnsavedChanges).toBe(true)
    expect(AssignedWorkService.saveComment).not.toHaveBeenCalled()

    await flushTimers()

    // Both edits collapse into ONE save, same as the answers do.
    expect(AssignedWorkService.saveComment).toHaveBeenCalledTimes(1)
    expect(AssignedWorkService.saveComment).toHaveBeenCalledWith('aw-1', {
      content: makeRichText('whole')
    })
    // A comment on its own must not drag the untouched answers along.
    expect(AssignedWorkService.saveAnswer).not.toHaveBeenCalled()

    expect(store.ownComment._status).toBe('saved')
    expect(store.ownComment.id).toBe('comment-1')
    expect(store.hasUnsavedChanges).toBe(false)
  })

  test('does not autosave the comment in read mode', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('read')

    store.updateComment(makeRichText('should-not-save'))

    await flushTimers()

    expect(AssignedWorkService.saveComment).not.toHaveBeenCalled()
  })

  test('leaves the comment dirty when saving it fails', async () => {
    ;(AssignedWorkService.saveComment as Mock).mockResolvedValueOnce({
      error: { id: 'BOOM', statusCode: 500, name: 'err', payload: null }
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    store.updateComment(makeRichText('x'))

    await flushTimers()

    expect(store.saveStatus.hasError).toBe(true)
    expect(store.ownComment._status).toBe('modified')
    expect(store.hasUnsavedChanges).toBe(true)
  })
})

describe('useAssignedWorkDetailStore — work comments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockSaveCommentOk()
  })

  afterEach(() => {
    vi.clearAllMocks()
    principal.value = null
  })

  async function initWith(
    assignedWork: AssignedWorkEntity
  ): Promise<ReturnType<typeof useAssignedWorkDetailStore>> {
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: assignedWork
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')

    return store
  }

  function makeWorkWithComments(): AssignedWorkEntity {
    const assignedWork = makeAssignedWork()

    assignedWork.mainMentorId = 'mentor-1'
    assignedWork.helperMentorId = 'mentor-2'
    assignedWork.studentComment = {
      _entityName: 'AssignedWorkComment',
      id: 'c-student',
      content: makeRichText('from the student')
    } as AssignedWorkEntity['studentComment']
    assignedWork.mainMentorComment = {
      _entityName: 'AssignedWorkComment',
      id: 'c-main',
      content: makeRichText('from the main mentor')
    } as AssignedWorkEntity['mainMentorComment']

    return assignedWork
  }

  test('seats the student on their own comment and seeds the draft from it', async () => {
    principal.value = { id: 'student-1', role: 'student' }

    const store = await initWith(makeWorkWithComments())

    expect(store.ownCommentSeat).toBe('student')
    expect(store.ownComment.id).toBe('c-student')
    expect(store.ownComment._status).toBe('saved')
    expect(store.commentOf('student')).toEqual(makeRichText('from the student'))
    expect(store.commentOf('main-mentor')).toEqual(
      makeRichText('from the main mentor')
    )
    // Nobody has written in the helper mentor's seat yet.
    expect(store.commentOf('helper-mentor')).toBeNull()
  })

  test('seats a helper mentor on the helper comment, empty until they write', async () => {
    principal.value = { id: 'mentor-2', role: 'mentor' }

    const store = await initWith(makeWorkWithComments())

    expect(store.ownCommentSeat).toBe('helper-mentor')
    expect(store.ownComment._status).toBe('empty')
    expect(store.ownComment.id).toBeUndefined()

    store.setMode('check')
    store.updateComment(makeRichText('from the helper'))

    // The draft is what the user's own seat shows, before it is saved.
    expect(store.commentOf('helper-mentor')).toEqual(
      makeRichText('from the helper')
    )
    expect(store.canEditOwnComment).toBe(true)
  })

  test('gives an onlooker no seat and nothing to edit', async () => {
    principal.value = { id: 'assistant-1', role: 'assistant' }

    const store = await initWith(makeWorkWithComments())

    store.setMode('check')

    expect(store.ownCommentSeat).toBeNull()
    expect(store.canEditOwnComment).toBe(false)
    // The comments already on the work are still readable.
    expect(store.commentOf('student')).toEqual(makeRichText('from the student'))
  })

  test('reset drops the comment draft', async () => {
    principal.value = { id: 'student-1', role: 'student' }

    const store = await initWith(makeWorkWithComments())

    store.reset()

    expect(store.ownComment._status).toBe('empty')
    expect(store.ownComment.content).toBeNull()
    expect(store.ownCommentSeat).toBeNull()
  })
})

describe('useAssignedWorkDetailStore — totalScore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: makeAssignedWork()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('reports the score the server sent outside check mode', async () => {
    const assignedWork = makeAssignedWork()

    assignedWork.score = 4
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: assignedWork
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('read')

    // Local answer scores must not bend the figure a reader is shown.
    store.updateAnswer('t-1', { score: 5 })

    expect(store.totalScore).toBe(4)
  })

  test('is null in check mode while no task has been scored', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('check')

    expect(store.totalScore).toBeNull()
  })

  test('follows the scores the mentor hands out, task by task', async () => {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('check')

    store.updateAnswer('t-1', { score: 3 })

    expect(store.totalScore).toBe(3)

    store.updateAnswer('t-2', { score: 5 })

    expect(store.totalScore).toBe(8)

    // Corrections count too — the total is derived, never accumulated.
    store.updateAnswer('t-1', { score: 0 })

    expect(store.totalScore).toBe(5)
  })

  test('falls back to the score the server reported when there are no tasks', async () => {
    const assignedWork = makeAssignedWork()

    assignedWork.work = null
    assignedWork.score = 7
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: assignedWork
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('check')

    expect(store.totalScore).toBe(7)
  })
})

describe('useAssignedWorkDetailStore — deadlines', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    principal.value = { id: 'student-1', role: 'student' }
    ;(AssignedWorkService.shiftDeadline as Mock).mockResolvedValue({
      data: undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    principal.value = null
  })

  async function initWithDeadlines() {
    const assignedWork = makeAssignedWork()

    assignedWork.solveDeadlineAt = new Date('2026-01-01T00:00:00.000Z')
    assignedWork.checkDeadlineAt = new Date('2026-01-05T00:00:00.000Z')
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: assignedWork
    })

    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')

    return store
  }

  /**
   * `assignedWork` is a shallowRef, so the shifted date used to be written into
   * the object in place — the value moved but the sidebar showing it never
   * heard about it.
   */
  test('shifting the solve deadline reaches whatever is reading it', async () => {
    const store = await initWithDeadlines()

    const shown: (Date | null | undefined)[] = []
    const deadline = computed(() => store.assignedWork?.solveDeadlineAt)
    watchEffect(() => shown.push(deadline.value), { flush: 'sync' })

    await store.shiftSolveDeadline.execute()

    expect(shown).toHaveLength(2)
    expect(shown[1]).not.toEqual(shown[0])
    expect(store.assignedWork!.checkDeadlineAt).not.toEqual(
      new Date('2026-01-05T00:00:00.000Z')
    )
  })

  test('shifting the check deadline reaches whatever is reading it', async () => {
    const store = await initWithDeadlines()

    const shown: (Date | null | undefined)[] = []
    const deadline = computed(() => store.assignedWork?.checkDeadlineAt)
    watchEffect(() => shown.push(deadline.value), { flush: 'sync' })

    await store.shiftCheckDeadline.execute()

    expect(shown).toHaveLength(2)
    expect(shown[1]).not.toEqual(shown[0])
    // The solve deadline is not the one being moved.
    expect(store.assignedWork!.solveDeadlineAt).toEqual(
      new Date('2026-01-01T00:00:00.000Z')
    )
  })
})

describe('useAssignedWorkDetailStore — checking one task on its own', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    principal.value = { id: 'student-1', role: 'student' }
    ;(AssignedWorkService.getById as Mock).mockResolvedValue({
      data: makeAssignedWork()
    })
    mockSaveAnswerOk()
    ;(AssignedWorkService.checkTask as Mock).mockResolvedValue({
      data: {
        taskId: 't-1',
        answerId: 'answer-1',
        score: 4,
        maxScore: 5,
        isCorrect: false
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    principal.value = null
  })

  async function solvingStore() {
    const store = useAssignedWorkDetailStore()

    await store.init('aw-1')
    store.setMode('solve')

    return store
  }

  test('saves what the student typed before asking for a verdict on it', async () => {
    const store = await solvingStore()

    store.updateAnswer('t-1', { wordContent: 'my answer' })

    expect(await store.checkTask('t-1')).toBe(true)

    // What the server scores has to be what the student can see.
    expect(AssignedWorkService.saveAnswer).toHaveBeenCalledTimes(1)
    const saveCall = (AssignedWorkService.saveAnswer as Mock).mock
      .invocationCallOrder[0]
    const checkCall = (AssignedWorkService.checkTask as Mock).mock
      .invocationCallOrder[0]

    expect(saveCall).toBeLessThan(checkCall)
    expect(AssignedWorkService.checkTask).toHaveBeenCalledWith('aw-1', 't-1')
  })

  test('locks the answer under the verdict the server gave', async () => {
    const store = await solvingStore()

    store.updateAnswer('t-1', { wordContent: 'my answer' })
    await store.checkTask('t-1')

    expect(store.answers['t-1']).toMatchObject({
      id: 'answer-1',
      score: 4,
      status: 'checked',
      _status: 'saved'
    })
    // Nothing is left pending, so autosave has nothing more to send.
    expect(store.hasUnsavedChanges).toBe(false)
  })

  test('leaves the answer alone when the check fails', async () => {
    ;(AssignedWorkService.checkTask as Mock).mockResolvedValueOnce({
      error: { id: 'BOOM', statusCode: 409, name: 'err', payload: null }
    })

    const store = await solvingStore()

    store.updateAnswer('t-1', { wordContent: 'my answer' })

    expect(await store.checkTask('t-1')).toBe(false)
    expect(store.answers['t-1'].status).toBe('not-submitted')
    expect(store.answers['t-1'].score).toBeNull()
  })

  test('does not check when saving the answer failed first', async () => {
    ;(AssignedWorkService.saveAnswer as Mock).mockResolvedValueOnce({
      error: { id: 'BOOM', statusCode: 500, name: 'err', payload: null }
    })

    const store = await solvingStore()

    store.updateAnswer('t-1', { wordContent: 'my answer' })

    expect(await store.checkTask('t-1')).toBe(false)
    expect(AssignedWorkService.checkTask).not.toHaveBeenCalled()
  })

  test('refuses a second check while the first is still in flight', async () => {
    let release: ((value: unknown) => void) | null = null
    ;(AssignedWorkService.checkTask as Mock).mockImplementation(async () => {
      await new Promise((resolve) => {
        release = resolve
      })

      return {
        data: {
          taskId: 't-1',
          answerId: 'a',
          score: 1,
          maxScore: 5,
          isCorrect: false
        }
      }
    })

    const store = await solvingStore()

    store.updateAnswer('t-1', { wordContent: 'my answer' })

    const first = store.checkTask('t-1')

    // The save runs first, so wait for the check itself to be in flight.
    await vi.waitUntil(
      () => (AssignedWorkService.checkTask as Mock).mock.calls.length === 1
    )
    expect(store.taskBeingChecked).toBe('t-1')
    expect(await store.checkTask('t-1')).toBe(false)

    release!(undefined)
    await first

    expect(store.taskBeingChecked).toBeNull()
    expect(AssignedWorkService.checkTask).toHaveBeenCalledTimes(1)
  })

  test('asks the server for an answer key rather than reading one off the work', async () => {
    ;(AssignedWorkService.getTaskAnswerKey as Mock).mockResolvedValue({
      data: { taskId: 't-1', rightAnswers: ['the answer'] }
    })

    const store = await solvingStore()

    await store.revealTaskAnswer.execute('t-1')

    expect(AssignedWorkService.getTaskAnswerKey).toHaveBeenCalledWith(
      'aw-1',
      't-1'
    )
    expect(store.revealTaskAnswer.data?.rightAnswers).toEqual(['the answer'])
  })
})
