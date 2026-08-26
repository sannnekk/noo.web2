import type { IconName } from '@/components/icons/noo-icon.vue'
import type { PossiblyUnsavedAnswer, TaskCheckStatus, TaskGrid } from './types'

/**
 * What the score on an answer says about the task it belongs to. Only the
 * absence of a score reads as unchecked — zero is a verdict like any other.
 */
function resolveAnswerCheckStatus(
  answer: PossiblyUnsavedAnswer
): TaskCheckStatus {
  if (typeof answer.score !== 'number' || typeof answer.maxScore !== 'number') {
    return 'none'
  }

  if (answer.score >= answer.maxScore) {
    return 'correct'
  }

  return answer.score > 0 ? 'partially-correct' : 'incorrect'
}

/**
 * The icon one cell of the grid carries.
 *
 * A score outranks anything else the cell could report, and it counts from the
 * moment a mentor picks it rather than from whenever the work around it is
 * finally marked checked. It is read off the score alone, so a task the student
 * skipped is marked up like any other once it has been given one — the answer's
 * own status has nothing to say about a verdict on it.
 *
 * Only an unscored task falls back to reporting whether it has been answered,
 * which is all there is to say about one still being solved.
 */
function resolveTaskGridIcon(item: TaskGrid[number]): IconName | undefined {
  switch (item.checkStatus) {
    case 'correct':
      return 'check-green'
    case 'partially-correct':
      return 'attention-yellow'
    case 'incorrect':
      return 'cross-red'
  }

  return item.hasAnswer && item.status === 'not-submitted'
    ? 'check-green'
    : undefined
}

export { resolveAnswerCheckStatus, resolveTaskGridIcon }
