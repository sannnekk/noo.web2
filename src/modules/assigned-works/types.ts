import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type {
  AssignedWorkAnswerEntity,
  AssignedWorkAnswerStatus,
  AssignedWorkCommentEntity
} from './api/assigned-work.types'

export type AssignedWorkViewMode = 'read' | 'solve' | 'check'

/**
 * Tracks the client-side lifecycle of a draft the user is writing:
 * - `empty`:    a freshly created draft the user has not touched.
 * - `modified`: user has edited it; needs to be persisted.
 * - `saved`:    it is in sync with the server.
 */
export type DraftStatus = 'empty' | 'modified' | 'saved'

export type PossiblyUnsavedAnswer = PossiblyUnsavedEntity<
  AssignedWorkAnswerEntity,
  AssignedWorkAnswerEntity['_entityName']
> & {
  _status: DraftStatus
}

export type PossiblyUnsavedComment = PossiblyUnsavedEntity<
  AssignedWorkCommentEntity,
  AssignedWorkCommentEntity['_entityName']
> & {
  _status: DraftStatus
}

/**
 * Whose comment on the work as a whole this is. A work carries exactly one per
 * participant, and a user writes into the seat they hold on that work — the
 * server decides it the same way, from the work rather than from the request.
 */
export type AssignedWorkCommentSeat =
  'student' | 'main-mentor' | 'helper-mentor'

export type TaskGrid = {
  taskId: string
  hasAnswer: boolean
  status: AssignedWorkAnswerStatus
  checkStatus: 'none' | 'correct' | 'incorrect' | 'partially-correct'
}[]

/**
 * The tabs of the list page, in the order it renders them. The page's slots
 * (`#tab-<name>`), the store's per-tab queries and the route guard are all keyed
 * off this, so a tab cannot exist in one of them and not the others.
 */
export const assignedWorkListTabs = [
  'all',
  'not-made',
  'not-checked',
  'checked'
] as const

export type AssignedWorkListTab = (typeof assignedWorkListTabs)[number]

/**
 * How one block of the task view is presented: absent, shown as given, or open
 * for editing.
 */
export type TaskBlockPresentation = 'hidden' | 'readonly' | 'editable'

/**
 * How one of the task's hints is presented. Collapsed means the reader has to
 * ask for it — a hint given away unasked is not much of a hint.
 */
export type TaskHintPresentation = 'hidden' | 'collapsed' | 'expanded'

/**
 * What the task view shows, block by block. The single description of the
 * difference between reading a task, solving it and checking it — see
 * `resolveTaskViewLayout()`.
 */
export interface TaskViewLayout {
  answer: TaskBlockPresentation
  score: TaskBlockPresentation
  mentorComment: TaskBlockPresentation
  solveHint: TaskHintPresentation
  explanation: TaskHintPresentation
}
