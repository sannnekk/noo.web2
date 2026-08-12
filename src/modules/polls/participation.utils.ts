import type { FileKind } from '@/components/files/file-kind.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type {
  CreatePollAnswerPayload,
  PollAnswerEntity,
  PollQuestionEntity
} from './api/poll.types'
import { pollFileTypeGroups, POLL_MAX_FILE_COUNT } from './constants'
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
    case 'files':
      return []
    default:
      return null
  }
}

function isMediaEntity(value: unknown): value is MediaEntity {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as MediaEntity)._entityName === 'Media' &&
    typeof (value as MediaEntity).id === 'string'
  )
}

/**
 * The files already attached to a `files` answer, and nothing else — the other
 * question types never hold media.
 */
function toAnswerFiles(value: PollAnswerInputValue): MediaEntity[] {
  return Array.isArray(value) ? value.filter(isMediaEntity) : []
}

/**
 * How many files a question takes. The API caps it, so a question that does not
 * say lands on the same ceiling the API would apply.
 */
function maxFileCount(question: PollQuestionEntity): number {
  return question.config.maxFileCount ?? POLL_MAX_FILE_COUNT
}

/**
 * The kinds of file the uploader should offer, translated from the MIME types
 * the question stores. A question that names none accepts everything the
 * uploader can handle.
 */
function toFileKinds(question: PollQuestionEntity): FileKind[] {
  const allowed = question.config.allowedFileTypes

  if (!allowed?.length) {
    return pollFileTypeGroups.map((group) => group.kind)
  }

  return pollFileTypeGroups
    .filter((group) =>
      group.mimeTypes.some((mimeType) => allowed.includes(mimeType))
    )
    .map((group) => group.kind)
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

/**
 * Whether a stored answer says anything. Every question of a poll gets an answer
 * row, including the optional ones nobody filled in, so the row's presence is no
 * proof that it was answered.
 */
function isAnswerFilled(answer: PollAnswerEntity | undefined): boolean {
  if (!answer) {
    return false
  }

  if (answer.value.type === 'files') {
    return (answer.medias ?? []).length > 0
  }

  return !isEmptyValue(answer.value.value as PollAnswerInputValue)
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

    case 'files': {
      // The uploader already turns away files that are too large or of the wrong
      // kind, so the count is the only constraint an answer can still break.
      const limit = maxFileCount(question)

      if (toAnswerFiles(value).length > limit) {
        errors.push(error(`Можно приложить не больше ${limit} файлов`))
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
  // A file answer is its files: they are already uploaded, so the answer names
  // them by id and carries no value of its own.
  if (question.type === 'files') {
    return {
      pollQuestionId: question.id,
      value: { type: question.type, value: null },
      mediaIds: toAnswerFiles(value).map((media) => media.id)
    }
  }

  return {
    pollQuestionId: question.id,
    value: isAnswered(question, value)
      ? { type: question.type, value }
      : { type: question.type, value: null },
    mediaIds: []
  }
}

/**
 * Whether a value can still be used as an answer to a question. A restored
 * draft is the main source of values nobody typed in this session: the poll may
 * have been edited since, so a value that no longer fits its question — or a
 * choice that was removed from it — is dropped rather than shown.
 */
function matchesQuestionType(
  question: PollQuestionEntity,
  value: unknown
): value is PollAnswerInputValue {
  const options = question.config.options ?? []

  switch (question.type) {
    case 'checkbox':
      return typeof value === 'boolean'
    case 'number':
    case 'rating':
      return typeof value === 'number' && Number.isFinite(value)
    case 'date':
    case 'date-time':
      return value instanceof Date && !Number.isNaN(value.getTime())
    case 'text':
      return typeof value === 'string'
    case 'single-choice':
      return typeof value === 'string' && options.includes(value)
    case 'multiple-choice':
      return (
        Array.isArray(value) &&
        value.every(
          (entry) => typeof entry === 'string' && options.includes(entry)
        )
      )
    // The files of a restored draft were uploaded in the earlier visit, so they
    // are still there to be sent — what is stored is the media they became.
    case 'files':
      return Array.isArray(value) && value.every(isMediaEntity)
    default:
      return false
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
  isAnswerFilled,
  isEmptyValue,
  matchesQuestionType,
  maxFileCount,
  toAnswerFiles,
  toAnswerOptions,
  toAnswerPayload,
  toFileKinds,
  validateAnswer
}
