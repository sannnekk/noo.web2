import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'

export type WorkType =
  | 'mini-test'
  | 'test'
  | 'trial-work'
  | 'phrase'
  | 'second-part'

export type WorkTaskType =
  | 'word'
  | 'text'
  | 'essay'
  | 'final-essay'
  | 'dictation'

export type WorkTaskCheckStrategy =
  | 'manual'
  | 'exact-match-or-zero'
  | 'exact-match-with-wrong-character'
  | 'multiple-choice'
  | 'sequence'

export interface WorkEntity extends ApiEntity {
  title: string
  type: WorkType
  description: string | null
  subjectId: string
  subject?: SubjectEntity
  tasks?: WorkTaskEntity[]
}

export interface UnsavedWork
  extends Omit<PossiblyUnsavedEntity<WorkEntity>, 'tasks'> {
  tasks?: PossiblyUnsavedEntity<WorkTaskEntity>[]
}

export interface WorkTaskEntity extends ApiEntity {
  type: WorkTaskType
  order: number
  maxScore: number
  content: IRichText
  rightAnswers: string[] | null
  solveHint: IRichText | null
  explanation: IRichText | null
  checkStrategy: WorkTaskCheckStrategy
  showAnswerBeforeCheck: boolean
  checkOneByOne: boolean
}

export interface WorkStatistics {
  hardestTaskSummaries: {
    taskId: WorkTaskEntity['id']
    avgScore: number
  }[]
  averageWorkScore: {
    absolute: number
    percentage: number
  } | null
  medianWorkScore: {
    absolute: number
    percentage: number
  } | null
  workSolveCount: number
  work: WorkEntity
}
