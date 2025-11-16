import { richTextIsEmpty, richTextsAreEqual } from '@/core/utils/richtext.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import type {
  AssignedWorkAnswerEntity,
  AssignedWorkStatusHistoryType
} from './api/assigned-work.types'
import type { PossiblyUnsavedAnswer } from './types'

function answersAreEqual(
  answer1: AssignedWorkAnswerEntity,
  answer2: AssignedWorkAnswerEntity
): boolean {
  return (
    answer1.taskId === answer2.taskId &&
    answer1.score === answer2.score &&
    answer1.wordContent === answer2.wordContent &&
    JSON.stringify(answer1.detailedScore) ===
      JSON.stringify(answer2.detailedScore) &&
    richTextsAreEqual(answer1.richTextContent, answer2.richTextContent) &&
    richTextsAreEqual(answer1.mentorComment, answer2.mentorComment)
  )
}

function answerIsNotEmpty(
  task: WorkTaskEntity,
  answer?: AssignedWorkAnswerEntity | PossiblyUnsavedAnswer | null
): boolean {
  if (!answer) {
    return false
  }

  if (
    task.type === 'text' ||
    task.type === 'essay' ||
    task.type === 'final-essay'
  ) {
    return !richTextIsEmpty(answer.richTextContent)
  }

  return !!answer.wordContent?.trim().length
}

function readableHistoryStatus(status: AssignedWorkStatusHistoryType): string {
  switch (status) {
    case 'created':
      return 'Работа присвояна'
    case 'started-solving':
      return 'Работа начата'
    case 'solve-deadline-shifted':
      return 'Дедлайн решения сдвинут'
    case 'solved':
      return 'Работа сдана на проверку'
    case 'started-checking':
      return 'Проверка работы начата'
    case 'check-deadline-shifted':
      return 'Дедлайн проверки сдвинут'
    case 'checked':
      return 'Работа проверена'
    case 'sent-on-recheck':
      return 'Проверка отправлена на доработку'
    case 'sent-on-resolve':
      return 'Решение отправлено на доработку'
    default:
      return '-'
  }
}

export { answerIsNotEmpty, answersAreEqual, readableHistoryStatus }
