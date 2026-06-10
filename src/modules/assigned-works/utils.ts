import { richTextIsEmpty, richTextsAreEqual } from '@/core/utils/richtext.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import type { AssignedWorkAnswerEntity } from './api/assigned-work.types'
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

function percentageScore(
  score: number | null,
  maxScore: number | null
): number {
  if (score === null || maxScore === null || maxScore === 0) {
    return 0
  }

  return Math.round((score / maxScore) * 100)
}

export { answerIsNotEmpty, answersAreEqual, percentageScore }
