import type { MediaEntity } from '@/modules/media/api/media.types'
import { describe, expect, test } from 'vitest'
import type {
  PollAnswerEntity,
  PollQuestionConfig,
  PollQuestionEntity,
  PollQuestionType
} from './api/poll.types'
import {
  createEmptyAnswer,
  isAnswered,
  isAnswerFilled,
  matchesQuestionType,
  toAnswerOptions,
  toAnswerPayload,
  toFileKinds,
  validateAnswer
} from './participation.utils'

function makeQuestion(
  type: PollQuestionType,
  overrides: Partial<PollQuestionEntity> = {}
): PollQuestionEntity {
  return {
    _entityName: 'PollQuestion',
    id: 'question-1',
    createdAt: new Date(),
    updatedAt: null,
    order: 1,
    title: 'Вопрос',
    description: null,
    isRequired: false,
    type,
    config: {} as PollQuestionConfig,
    ...overrides
  } as PollQuestionEntity
}

function makeMedia(id: string): MediaEntity {
  return {
    _entityName: 'Media',
    id,
    createdAt: new Date(),
    updatedAt: null,
    order: 0,
    path: `poll-answer-file/${id}.pdf`,
    name: `${id}.pdf`,
    actualName: 'ответ.pdf',
    extension: 'pdf',
    size: 1024,
    category: 'poll-answer-file',
    status: 'completed',
    url: ''
  } as MediaEntity
}

describe('participation utils', () => {
  describe('createEmptyAnswer', () => {
    test('should start a checkbox unchecked and a multiple choice empty', () => {
      expect(createEmptyAnswer(makeQuestion('checkbox'))).toBe(false)
      expect(createEmptyAnswer(makeQuestion('multiple-choice'))).toEqual([])
      expect(createEmptyAnswer(makeQuestion('text'))).toBeNull()
    })
  })

  describe('isAnswered', () => {
    test('should treat an unchecked checkbox as unanswered', () => {
      const question = makeQuestion('checkbox')

      expect(isAnswered(question, false)).toBe(false)
      expect(isAnswered(question, true)).toBe(true)
    })

    test('should treat blank values as unanswered', () => {
      const question = makeQuestion('text')

      expect(isAnswered(question, '')).toBe(false)
      expect(isAnswered(question, null)).toBe(false)
      expect(isAnswered(question, 'Ответ')).toBe(true)
    })
  })

  describe('validateAnswer', () => {
    test('should not complain about a blank optional question', () => {
      expect(validateAnswer(makeQuestion('text'), null)).toEqual([])
    })

    test('should complain about a blank required question', () => {
      const question = makeQuestion('text', { isRequired: true })

      expect(validateAnswer(question, null)).toHaveLength(1)
    })

    test('should enforce the text length limits', () => {
      const question = makeQuestion('text', {
        config: { minTextLength: 5, maxTextLength: 10 }
      })

      expect(validateAnswer(question, 'нет')).toHaveLength(1)
      expect(validateAnswer(question, 'нормальный ответ')).toHaveLength(1)
      expect(validateAnswer(question, 'подходит')).toEqual([])
    })

    test('should enforce the number range', () => {
      const question = makeQuestion('number', {
        config: { minIntValue: 1, maxIntValue: 5 }
      })

      expect(validateAnswer(question, 0)).toHaveLength(1)
      expect(validateAnswer(question, 6)).toHaveLength(1)
      expect(validateAnswer(question, 3)).toEqual([])
    })

    test('should enforce the choice count', () => {
      const question = makeQuestion('multiple-choice', {
        config: { minChoices: 2, maxChoices: 3 }
      })

      expect(validateAnswer(question, ['a'])).toHaveLength(1)
      expect(validateAnswer(question, ['a', 'b', 'c', 'd'])).toHaveLength(1)
      expect(validateAnswer(question, ['a', 'b'])).toEqual([])
    })

    test('should enforce the file count', () => {
      const question = makeQuestion('files', { config: { maxFileCount: 1 } })

      expect(validateAnswer(question, [makeMedia('media-1')])).toEqual([])
      expect(
        validateAnswer(question, [makeMedia('media-1'), makeMedia('media-2')])
      ).toHaveLength(1)
    })

    test('should complain about a required files question left empty', () => {
      const question = makeQuestion('files', { isRequired: true })

      expect(validateAnswer(question, [])).toHaveLength(1)
      expect(validateAnswer(question, [makeMedia('media-1')])).toEqual([])
    })
  })

  describe('toAnswerPayload', () => {
    test('should wrap the value together with the question type', () => {
      const question = makeQuestion('text')

      expect(toAnswerPayload(question, 'Ответ')).toEqual({
        pollQuestionId: 'question-1',
        value: { type: 'text', value: 'Ответ' },
        mediaIds: []
      })
    })

    test('should send an unanswered question with a null value', () => {
      const question = makeQuestion('single-choice')

      expect(toAnswerPayload(question, null)).toEqual({
        pollQuestionId: 'question-1',
        value: { type: 'single-choice', value: null },
        mediaIds: []
      })
    })

    test('should send a files answer as the ids of its uploads', () => {
      const question = makeQuestion('files')

      expect(toAnswerPayload(question, [makeMedia('media-1')])).toEqual({
        pollQuestionId: 'question-1',
        value: { type: 'files', value: null },
        mediaIds: ['media-1']
      })
    })
  })

  describe('matchesQuestionType', () => {
    test('should accept a value of the question own type', () => {
      expect(matchesQuestionType(makeQuestion('text'), 'Ответ')).toBe(true)
      expect(matchesQuestionType(makeQuestion('number'), 3)).toBe(true)
      expect(matchesQuestionType(makeQuestion('checkbox'), true)).toBe(true)
      expect(matchesQuestionType(makeQuestion('date'), new Date())).toBe(true)
    })

    test('should reject a value of another type', () => {
      expect(matchesQuestionType(makeQuestion('number'), 'три')).toBe(false)
      expect(matchesQuestionType(makeQuestion('text'), 3)).toBe(false)
      expect(matchesQuestionType(makeQuestion('date'), 'вчера')).toBe(false)
      expect(matchesQuestionType(makeQuestion('checkbox'), 'да')).toBe(false)
      expect(matchesQuestionType(makeQuestion('text'), undefined)).toBe(false)
    })

    test('should restore the uploads of a files draft', () => {
      const question = makeQuestion('files')

      expect(matchesQuestionType(question, [makeMedia('media-1')])).toBe(true)
      expect(matchesQuestionType(question, ['media-1'])).toBe(false)
    })

    test('should reject a choice the question no longer offers', () => {
      const single = makeQuestion('single-choice', {
        config: { options: ['Да', 'Нет'] }
      })
      const multiple = makeQuestion('multiple-choice', {
        config: { options: ['Да', 'Нет'] }
      })

      expect(matchesQuestionType(single, 'Да')).toBe(true)
      expect(matchesQuestionType(single, 'Может быть')).toBe(false)
      expect(matchesQuestionType(multiple, ['Да', 'Нет'])).toBe(true)
      expect(matchesQuestionType(multiple, ['Да', 'Может быть'])).toBe(false)
    })
  })

  describe('isAnswerFilled', () => {
    function makeAnswer(
      type: PollQuestionType,
      value: unknown,
      medias: MediaEntity[] = []
    ): PollAnswerEntity {
      return {
        _entityName: 'PollAnswer',
        id: 'answer-1',
        createdAt: new Date(),
        updatedAt: null,
        pollQuestionId: 'question-1',
        value: { type, value },
        medias
      } as PollAnswerEntity
    }

    test('should treat a stored blank answer as unanswered', () => {
      expect(isAnswerFilled(undefined)).toBe(false)
      expect(isAnswerFilled(makeAnswer('text', null))).toBe(false)
      expect(isAnswerFilled(makeAnswer('multiple-choice', []))).toBe(false)
      expect(isAnswerFilled(makeAnswer('text', 'Ответ'))).toBe(true)
    })

    test('should read a files answer from its attachments', () => {
      expect(isAnswerFilled(makeAnswer('files', null))).toBe(false)
      expect(
        isAnswerFilled(makeAnswer('files', null, [makeMedia('media-1')]))
      ).toBe(true)
    })
  })

  describe('toFileKinds', () => {
    test('should offer every kind when the question names no types', () => {
      expect(toFileKinds(makeQuestion('files'))).toEqual(['image', 'pdf'])
    })

    test('should narrow the kinds down to the configured mime types', () => {
      const question = makeQuestion('files', {
        config: { allowedFileTypes: ['application/pdf'] }
      })

      expect(toFileKinds(question)).toEqual(['pdf'])
    })
  })

  describe('toAnswerOptions', () => {
    test('should map the configured options onto select options', () => {
      const question = makeQuestion('single-choice', {
        config: { options: ['Да', 'Нет'] }
      })

      expect(toAnswerOptions(question)).toEqual([
        { label: 'Да', value: 'Да' },
        { label: 'Нет', value: 'Нет' }
      ])
    })
  })
})
