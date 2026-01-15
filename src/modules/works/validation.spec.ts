import type { IRichText } from '@/core/utils/richtext.utils'
import { emptyRichText } from '@/core/utils/richtext.utils'
import { describe, expect, it } from 'vitest'
import type { PossiblyUnsavedWork, PossiblyUnsavedWorkTask } from './types'
import { validateWorkState, validateWorkTaskState } from './utils'

const validSubjectId = '01ARZ3NDEKTSV4RRFFQ69G5FAV'

const nonEmptyRichText: IRichText = {
  $type: 'delta',
  ops: [{ insert: 'Текст' }]
}

const validTask: PossiblyUnsavedWorkTask = {
  _entityName: 'WorkTask',
  _key: 'task-1',
  order: 1,
  content: nonEmptyRichText,
  type: 'word',
  checkStrategy: 'exact-match-or-zero',
  maxScore: 1,
  rightAnswers: ['Ответ'],
  explanation: null,
  solveHint: null,
  showAnswerBeforeCheck: false,
  checkOneByOne: false
}

const validWork: PossiblyUnsavedWork = {
  _entityName: 'Work',
  _key: 'work-1',
  title: 'Пробная работа',
  type: 'test',
  description: null,
  subjectId: validSubjectId,
  tasks: [validTask]
}

describe('works validation', () => {
  it('returns field errors for invalid work', () => {
    const result = validateWorkState({
      ...validWork,
      title: '',
      subjectId: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.title?.length).toBeGreaterThan(0)
    expect(result.fieldErrors.subjectId?.length).toBeGreaterThan(0)
    expect(result.messages.length).toBeGreaterThan(0)
  })

  it('returns field error for empty task content', () => {
    const result = validateWorkTaskState({
      ...validTask,
      type: 'text',
      checkStrategy: 'manual',
      content: emptyRichText(),
      rightAnswers: null
    })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.content?.length).toBeGreaterThan(0)
  })

  it('returns field error for missing right answers in auto-check', () => {
    const result = validateWorkTaskState({
      ...validTask,
      rightAnswers: []
    })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.rightAnswers?.length).toBeGreaterThan(0)
  })

  it('passes validation for a correct task', () => {
    const result = validateWorkTaskState(validTask)

    expect(result.isValid).toBe(true)
    expect(result.messages).toHaveLength(0)
  })
})
