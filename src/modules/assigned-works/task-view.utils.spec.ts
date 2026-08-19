import { describe, expect, test } from 'vitest'
import { isAnswerSubmitted, resolveTaskViewLayout } from './task-view.utils'

describe('task view layout', () => {
  describe('isAnswerSubmitted', () => {
    test('should count a submitted and a checked answer as handed in', () => {
      expect(isAnswerSubmitted('not-submitted')).toBe(false)
      expect(isAnswerSubmitted('submitted')).toBe(true)
      expect(isAnswerSubmitted('checked')).toBe(true)
    })
  })

  describe('solve mode', () => {
    test('should show only the task, the answer field and the hint', () => {
      expect(
        resolveTaskViewLayout({ mode: 'solve', answerStatus: 'not-submitted' })
      ).toEqual({
        answer: 'editable',
        score: 'hidden',
        mentorComment: 'hidden',
        solveHint: 'collapsed',
        explanation: 'hidden'
      })
    })

    test('should not change once the answer was submitted', () => {
      expect(
        resolveTaskViewLayout({ mode: 'solve', answerStatus: 'submitted' })
      ).toEqual(
        resolveTaskViewLayout({ mode: 'solve', answerStatus: 'not-submitted' })
      )
    })
  })

  describe('check mode', () => {
    test('should open the score and the comment, and show both hints', () => {
      expect(
        resolveTaskViewLayout({ mode: 'check', answerStatus: 'submitted' })
      ).toEqual({
        answer: 'readonly',
        score: 'editable',
        mentorComment: 'editable',
        solveHint: 'expanded',
        explanation: 'expanded'
      })
    })

    test('should never hand the answer itself to the mentor for editing', () => {
      const layout = resolveTaskViewLayout({
        mode: 'check',
        answerStatus: 'checked'
      })

      expect(layout.answer).toBe('readonly')
    })
  })

  describe('read mode', () => {
    test('should show the answer, its score and its comment once submitted', () => {
      expect(
        resolveTaskViewLayout({ mode: 'read', answerStatus: 'submitted' })
      ).toEqual({
        answer: 'readonly',
        score: 'readonly',
        mentorComment: 'readonly',
        solveHint: 'expanded',
        explanation: 'expanded'
      })
    })

    test('should hide everything about an answer that was never submitted', () => {
      const layout = resolveTaskViewLayout({
        mode: 'read',
        answerStatus: 'not-submitted'
      })

      expect(layout.answer).toBe('hidden')
      expect(layout.score).toBe('hidden')
      expect(layout.mentorComment).toBe('hidden')
    })

    test('should still show both hints without an answer', () => {
      const layout = resolveTaskViewLayout({
        mode: 'read',
        answerStatus: 'not-submitted'
      })

      expect(layout.solveHint).toBe('expanded')
      expect(layout.explanation).toBe('expanded')
    })

    test('should never open anything for editing', () => {
      for (const answerStatus of [
        'not-submitted',
        'submitted',
        'checked'
      ] as const) {
        const layout = resolveTaskViewLayout({ mode: 'read', answerStatus })

        expect(Object.values(layout)).not.toContain('editable')
      }
    })
  })

  describe('a task checked on its own, mid-solve', () => {
    // `checkOneByOne` lets a task be finished while the rest of the work is not.
    const layout = resolveTaskViewLayout({
      mode: 'solve',
      answerStatus: 'checked'
    })

    test('closes the answer to further edits', () => {
      expect(layout.answer).toBe('readonly')
    })

    test('shows the score it was just given', () => {
      expect(layout.score).toBe('readonly')
    })

    test('opens the explanation, there being nothing left to work out', () => {
      expect(layout.explanation).toBe('expanded')
      expect(layout.solveHint).toBe('expanded')
    })

    test('still has no mentor comment to show', () => {
      expect(layout.mentorComment).toBe('hidden')
    })
  })
})
