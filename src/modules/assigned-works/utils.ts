import { richTextIsEmpty, richTextsAreEqual } from '@/core/utils/richtext.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import type {
  AssignedWorkAnswerEntity,
  CheckStatus,
  SolveStatus
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

function percentageScore(
  score: number | null,
  maxScore: number | null
): number {
  if (score === null || maxScore === null || maxScore === 0) {
    return 0
  }

  return Math.round((score / maxScore) * 100)
}

/**
 * Both solved statuses mean the work was handed in; they only differ in whether
 * it made the deadline.
 */
function workIsSolved(status: SolveStatus | undefined): boolean {
  return status === 'solved-in-deadline' || status === 'solved-after-deadline'
}

/**
 * All three checked statuses mean the work is done being checked.
 */
function workIsChecked(status: CheckStatus | undefined): boolean {
  return (
    status === 'checked-in-deadline' ||
    status === 'checked-after-deadline' ||
    status === 'checked-automatically'
  )
}

export {
  answerIsNotEmpty,
  answersAreEqual,
  percentageScore,
  workIsChecked,
  workIsSolved
}
