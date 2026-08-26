import { describe, expect, test } from 'vitest'
import {
  resolveAnswerCheckStatus,
  resolveTaskGridIcon
} from './task-grid.utils'
import type { AssignedWorkAnswerStatus } from './api/assigned-work.types'
import type { PossiblyUnsavedAnswer, TaskCheckStatus, TaskGrid } from './types'

function answer(
  score: number | null,
  maxScore: number | null = 5
): PossiblyUnsavedAnswer {
  return { score, maxScore } as unknown as PossiblyUnsavedAnswer
}

function cell(options: {
  checkStatus?: TaskCheckStatus
  hasAnswer?: boolean
  status?: AssignedWorkAnswerStatus
}): TaskGrid[number] {
  return {
    taskId: 't-1',
    hasAnswer: options.hasAnswer ?? false,
    status: options.status ?? 'not-submitted',
    checkStatus: options.checkStatus ?? 'none'
  }
}

describe('resolveAnswerCheckStatus', () => {
  test('should call a task given full marks correct', () => {
    expect(resolveAnswerCheckStatus(answer(5))).toBe('correct')
  })

  test('should call anything between zero and full marks partially correct', () => {
    expect(resolveAnswerCheckStatus(answer(1))).toBe('partially-correct')
    expect(resolveAnswerCheckStatus(answer(4))).toBe('partially-correct')
  })

  // Zero is a verdict, not the absence of one.
  test('should call a task given nothing incorrect', () => {
    expect(resolveAnswerCheckStatus(answer(0))).toBe('incorrect')
  })

  test('should report no verdict at all until a score is given', () => {
    expect(resolveAnswerCheckStatus(answer(null))).toBe('none')
    expect(resolveAnswerCheckStatus(answer(3, null))).toBe('none')
  })
})

describe('resolveTaskGridIcon', () => {
  test('should mark up a task by the score it was given', () => {
    expect(resolveTaskGridIcon(cell({ checkStatus: 'correct' }))).toBe(
      'check-green'
    )
    expect(
      resolveTaskGridIcon(cell({ checkStatus: 'partially-correct' }))
    ).toBe('attention-yellow')
    expect(resolveTaskGridIcon(cell({ checkStatus: 'incorrect' }))).toBe(
      'cross-red'
    )
  })

  /**
   * The mentor's marks are worth showing as they are given, long before the
   * work around them is finally marked checked — and a task the student
   * skipped can be scored like any other, so the answer's own status must not
   * stand in the way of the verdict on it.
   */
  test('should mark up a scored task the student never answered', () => {
    const skipped = cell({
      checkStatus: 'incorrect',
      hasAnswer: false,
      status: 'not-submitted'
    })

    expect(resolveTaskGridIcon(skipped)).toBe('cross-red')
  })

  test('should let the score outrank the answered tick', () => {
    const answeredButWrong = cell({
      checkStatus: 'incorrect',
      hasAnswer: true,
      status: 'not-submitted'
    })

    expect(resolveTaskGridIcon(answeredButWrong)).toBe('cross-red')
  })

  test('should tick an unscored task that has been answered', () => {
    const written = cell({ hasAnswer: true, status: 'not-submitted' })

    expect(resolveTaskGridIcon(written)).toBe('check-green')
  })

  test('should say nothing about a task that is neither answered nor scored', () => {
    expect(resolveTaskGridIcon(cell({}))).toBeUndefined()
  })

  // Handed in and waiting on a mentor: the tick would read as a verdict.
  test('should say nothing about a submitted task still awaiting its score', () => {
    const waiting = cell({ hasAnswer: true, status: 'submitted' })

    expect(resolveTaskGridIcon(waiting)).toBeUndefined()
  })
})
