import type { AssignedWorkAnswerStatus } from './api/assigned-work.types'
import type { AssignedWorkViewMode, TaskViewLayout } from './types'

interface TaskViewLayoutInput {
  mode: AssignedWorkViewMode
  /**
   * Status of the answer to this one task, not of the work around it. The API
   * moves every answer to `submitted` when the work is handed in and to
   * `checked` when it is marked checked, so a task nobody answered stays
   * `not-submitted` even inside a work that was handed in. A task marked
   * `checkOneByOne` reaches `checked` on its own, while the work around it is
   * still being solved.
   */
  answerStatus: AssignedWorkAnswerStatus
}

/**
 * Whether the answer has left the student's hands. Everything a reader is shown
 * about an answer — the answer itself, its score, the comment on it — hangs on
 * this: before it, there is nothing to report.
 */
function isAnswerSubmitted(status: AssignedWorkAnswerStatus): boolean {
  return status !== 'not-submitted'
}

/**
 * Decides what the task view shows, block by block.
 *
 * This is the whole of the difference between the three modes. Changing what a
 * mode shows is a change here and nowhere else; the view renders what it is
 * told, and each block only decides how to present itself once it is asked to.
 */
function resolveTaskViewLayout({
  mode,
  answerStatus
}: TaskViewLayoutInput): TaskViewLayout {
  switch (mode) {
    // Nothing but the task and the answer being written, with the hint within
    // reach for whoever gets stuck — unless this task was checked on its own, in
    // which case it is finished mid-work and reads like a checked one.
    case 'solve':
      return answerStatus === 'checked'
        ? {
            answer: 'readonly',
            score: 'readonly',
            mentorComment: 'hidden',
            solveHint: 'expanded',
            explanation: 'expanded'
          }
        : {
            answer: 'editable',
            score: 'hidden',
            mentorComment: 'hidden',
            solveHint: 'collapsed',
            explanation: 'hidden'
          }

    // Reading mode with the mentor's two fields opened up: the explanation is
    // what the answer is being checked against, so it belongs here.
    case 'check':
      return {
        answer: 'readonly',
        score: 'editable',
        mentorComment: 'editable',
        solveHint: 'expanded',
        explanation: 'expanded'
      }

    case 'read':
    default: {
      const isSubmitted = isAnswerSubmitted(answerStatus)

      return {
        answer: isSubmitted ? 'readonly' : 'hidden',
        score: isSubmitted ? 'readonly' : 'hidden',
        mentorComment: isSubmitted ? 'readonly' : 'hidden',
        solveHint: 'expanded',
        explanation: 'expanded'
      }
    }
  }
}

export { isAnswerSubmitted, resolveTaskViewLayout, type TaskViewLayoutInput }
