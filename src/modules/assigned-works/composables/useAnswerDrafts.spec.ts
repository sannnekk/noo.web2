import { describe, expect, test, vi } from 'vitest'
import type { AssignedWorkEntity } from '../api/assigned-work.types'
import { useAnswerDrafts } from './useAnswerDrafts'

function makeWork(
  overrides: Partial<AssignedWorkEntity> = {}
): AssignedWorkEntity {
  return {
    id: 'aw-1',
    work: {
      tasks: [
        { id: 't-1', maxScore: 5 },
        { id: 't-2', maxScore: 7 }
      ]
    },
    answers: [],
    score: null,
    ...overrides
  } as unknown as AssignedWorkEntity
}

function drafts(work: AssignedWorkEntity | undefined, onChange = vi.fn()) {
  return { ...useAnswerDrafts(() => work, onChange), onChange }
}

describe('useAnswerDrafts', () => {
  test('seeds a blank draft for every task the work has no answer for', () => {
    const d = drafts(
      makeWork({
        answers: [
          { id: 'a-1', taskId: 't-1', score: 3 }
        ] as unknown as AssignedWorkEntity['answers']
      })
    )

    d.seed()

    expect(Object.keys(d.answers.value).sort()).toEqual(['t-1', 't-2'])
    expect(d.answers.value['t-1']).toMatchObject({
      id: 'a-1',
      _status: 'saved'
    })
    expect(d.answers.value['t-2']).toMatchObject({
      _status: 'empty',
      maxScore: 7
    })
    expect(d.hasChanges.value).toBe(false)
  })

  test('an edit marks the answer changed and reports it once', () => {
    const d = drafts(makeWork())

    d.seed()
    d.update('t-1', { wordContent: 'a' })
    d.update('t-1', { wordContent: 'ab' })

    expect(d.onChange).toHaveBeenCalledTimes(2)
    expect(d.changed.value).toHaveLength(1)
    expect(d.changed.value[0]).toMatchObject({
      taskId: 't-1',
      wordContent: 'ab'
    })
  })

  test('an edit to a task that is not in the work is ignored', () => {
    const d = drafts(makeWork())

    d.seed()
    d.update('t-9', { wordContent: 'nowhere' })

    expect(d.onChange).not.toHaveBeenCalled()
    expect(d.hasChanges.value).toBe(false)
  })

  test('saving stamps the server ids on and clears the changed flag', () => {
    const d = drafts(makeWork())

    d.seed()
    d.update('t-1', { wordContent: 'a' })
    d.markSaved({ 't-1': 'saved-1' })

    expect(d.answers.value['t-1']).toMatchObject({
      id: 'saved-1',
      _status: 'saved'
    })
    expect(d.hasChanges.value).toBe(false)
  })

  test('every task counts as answered only once none is still untouched', () => {
    const d = drafts(makeWork())

    d.seed()
    expect(d.allTasksAreAnswered.value).toBe(false)

    d.update('t-1', { wordContent: 'a' })
    expect(d.allTasksAreAnswered.value).toBe(false)

    d.update('t-2', { wordContent: 'b' })
    expect(d.allTasksAreAnswered.value).toBe(true)
  })

  test('a work whose tasks have not loaded has nothing to call answered', () => {
    const d = drafts(undefined)

    d.seed()

    expect(d.allTasksAreAnswered.value).toBe(false)
  })

  test('the score given adds up only the tasks that have one', () => {
    const d = drafts(makeWork())

    d.seed()
    expect(d.scoreGiven.value).toBeNull()

    d.update('t-1', { score: 3 })
    expect(d.scoreGiven.value).toBe(3)

    d.update('t-2', { score: 5 })
    expect(d.scoreGiven.value).toBe(8)

    // Corrections count too — the total is derived, never accumulated.
    d.update('t-1', { score: 0 })
    expect(d.scoreGiven.value).toBe(5)
  })

  test('reset empties the drafts', () => {
    const d = drafts(makeWork())

    d.seed()
    d.update('t-1', { wordContent: 'a' })
    d.reset()

    expect(d.answers.value).toEqual({})
    expect(d.hasChanges.value).toBe(false)
  })
})
