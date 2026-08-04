import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import type {
  CreatePollAnswerPayload,
  PollQuestionEntity
} from './api/poll.types'
import type { PollAnswerInputValue } from './types'

/**
 * The value an untouched question starts with. Every type gets the empty value
 * its input component expects, so the inputs never have to cope with
 * `undefined`.
 */
function createEmptyAnswer(question: PollQuestionEntity): PollAnswerInputValue {
  switch (question.type) {
    case 'checkbox':
      return false
    case 'multiple-choice':
      return []
    default:
      return null
  }
}

function isEmptyValue(value: PollAnswerInputValue): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

/**
 * Whether the visitor has actually answered the question. A checkbox is the odd
 * one out: an unchecked box is indistinguishable from an untouched one, so it
 * only counts as answered once it is ticked.
 */
function isAnswered(
  question: PollQuestionEntity,
  value: PollAnswerInputValue
): boolean {
  if (question.type === 'checkbox') {
    return value === true
  }

  return !isEmptyValue(value)
}

function error(message: string): ValidationError {
  return { kind: 'error', message }
}

/**
 * Validates a single answer against the question's own config. Optional
 * questions left blank are valid; the constraints only apply to answers that
 * were actually given.
 */
function validateAnswer(
  question: PollQuestionEntity,
  value: PollAnswerInputValue
): ValidationError[] {
  if (!isAnswered(question, value)) {
    if (!question.isRequired) {
      return []
    }

    return [
      error(
        question.type === 'checkbox'
          ? 'Отметьте этот пункт, чтобы продолжить'
          : 'Это обязательный вопрос'
      )
    ]
  }

  const config = question.config
  const errors: ValidationError[] = []

  switch (question.type) {
    case 'text': {
      const length = String(value).trim().length

      if (config.minTextLength && length < config.minTextLength) {
        errors.push(
          error(
            `Ответ должен содержать не менее ${config.minTextLength} символов`
          )
        )
      }

      if (config.maxTextLength && length > config.maxTextLength) {
        errors.push(
          error(`Ответ не может быть длиннее ${config.maxTextLength} символов`)
        )
      }

      break
    }

    case 'number': {
      const numberValue = Number(value)

      if (Number.isNaN(numberValue)) {
        errors.push(error('Введите число'))

        break
      }

      if (config.minIntValue != null && numberValue < config.minIntValue) {
        errors.push(
          error(`Значение должно быть не меньше ${config.minIntValue}`)
        )
      }

      if (config.maxIntValue != null && numberValue > config.maxIntValue) {
        errors.push(
          error(`Значение должно быть не больше ${config.maxIntValue}`)
        )
      }

      break
    }

    case 'multiple-choice': {
      const count = Array.isArray(value) ? value.length : 0

      if (config.minChoices && count < config.minChoices) {
        errors.push(error(`Выберите не менее ${config.minChoices} вариантов`))
      }

      if (config.maxChoices && count > config.maxChoices) {
        errors.push(error(`Выберите не более ${config.maxChoices} вариантов`))
      }

      break
    }
  }

  return errors
}

/**
 * Maps an answer onto the shape the API expects. Unanswered optional questions
 * are still sent, with a `null` value, so the participation mirrors the poll.
 */
function toAnswerPayload(
  question: PollQuestionEntity,
  value: PollAnswerInputValue
): CreatePollAnswerPayload {
  return {
    pollQuestionId: question.id,
    value: isAnswered(question, value)
      ? { type: question.type, value }
      : { type: question.type, value: null }
  }
}

/**
 * The choices a question offers, in the shape the select inputs expect.
 */
function toAnswerOptions(
  question: PollQuestionEntity
): { label: string; value: string }[] {
  return (question.config.options ?? []).map((option) => ({
    label: option,
    value: option
  }))
}

export {
  createEmptyAnswer,
  isAnswered,
  isEmptyValue,
  toAnswerOptions,
  toAnswerPayload,
  validateAnswer
}
