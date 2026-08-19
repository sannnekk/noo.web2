import { richTextIsEmpty } from '@/core/utils/richtext.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import type {
  AssignedWorkAnswerEntity,
  CheckStatus,
  SolveStatus
} from './api/assigned-work.types'
import type { PossiblyUnsavedAnswer } from './types'

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

export { answerIsNotEmpty, percentageScore, workIsChecked, workIsSolved }
