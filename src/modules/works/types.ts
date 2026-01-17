import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type { WorkEntity, WorkTaskEntity } from './api/work.types'

export type PossiblyUnsavedWork = Omit<
  PossiblyUnsavedEntity<WorkEntity, WorkEntity['_entityName']>,
  'subjectId' | 'tasks'
> & {
  subjectId: string | null
  tasks?: PossiblyUnsavedWorkTask[]
}

export type PossiblyUnsavedWorkTask = PossiblyUnsavedEntity<
  WorkTaskEntity,
  WorkTaskEntity['_entityName']
>
