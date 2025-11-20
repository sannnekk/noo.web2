import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type {
  AssignedWorkAnswerEntity,
  AssignedWorkAnswerStatus
} from './api/assigned-work.types'

export type AssignedWorkViewMode = 'read' | 'solve' | 'check'

export type PossiblyUnsavedAnswer = PossiblyUnsavedEntity<
  AssignedWorkAnswerEntity,
  AssignedWorkAnswerEntity['_entityName']
> & {
  isSaved: boolean
}

export type TaskGrid = {
  taskId: string
  hasAnswer: boolean
  status: AssignedWorkAnswerStatus
  checkStatus: 'none' | 'correct' | 'incorrect' | 'partially-correct'
}[]

export type AssignedWorkListTab = 'all' | 'not-made' | 'not-checked' | 'checked'
