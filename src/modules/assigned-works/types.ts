import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type {
  AssignedWorkAnswerEntity,
  AssignedWorkAnswerStatus
} from './api/assigned-work.types'

export type AssignedWorkViewMode = 'read' | 'solve' | 'check'

/**
 * Tracks the client-side lifecycle of an answer draft:
 * - `empty`:    a freshly created draft for a task the user has not touched.
 * - `modified`: user has edited the answer; needs to be persisted.
 * - `saved`:    answer is in sync with the server.
 */
export type AnswerDraftStatus = 'empty' | 'modified' | 'saved'

export type PossiblyUnsavedAnswer = PossiblyUnsavedEntity<
  AssignedWorkAnswerEntity,
  AssignedWorkAnswerEntity['_entityName']
> & {
  _status: AnswerDraftStatus
}

export type TaskGrid = {
  taskId: string
  hasAnswer: boolean
  status: AssignedWorkAnswerStatus
  checkStatus: 'none' | 'correct' | 'incorrect' | 'partially-correct'
}[]

export type AssignedWorkListTab = 'all' | 'not-made' | 'not-checked' | 'checked'
