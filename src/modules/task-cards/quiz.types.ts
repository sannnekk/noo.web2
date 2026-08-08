import type { SavedTaskEntity } from './api/saved-task.types'

/**
 * How a card is judged. Word tasks have an answer key the server can score
 * against; everything else the student marks for themselves.
 */
export type QuizCardKind = 'checked' | 'self-assessed'

export type QuizCardOutcome = 'correct' | 'incorrect'

/**
 * Where one card is in its own little lifecycle:
 * - `unanswered`: waiting for an answer, or for the answer to be revealed.
 * - `revealed`:   a self-assessed card has shown its explanation and is waiting
 *                 for the student to say how they did.
 * - `answered`:   the card has an outcome and the deck can move on.
 */
export type QuizCardStatus = 'unanswered' | 'revealed' | 'answered'

export interface QuizCard {
  savedTask: SavedTaskEntity
  kind: QuizCardKind
  status: QuizCardStatus
  /** What the student typed. Only meaningful for `checked` cards. */
  answer: string
  outcome: QuizCardOutcome | null
  /** Points awarded by the server. Only set for `checked` cards. */
  score: number | null
}

export type QuizStatus = 'loading' | 'running' | 'finished' | 'error'

/**
 * The one place that decides how a task is judged, so the card view and the
 * scoring agree by construction.
 */
export function resolveQuizCardKind(savedTask: SavedTaskEntity): QuizCardKind {
  return savedTask.task.type === 'word' ? 'checked' : 'self-assessed'
}
