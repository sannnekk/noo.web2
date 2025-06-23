import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type { WorkEntity, WorkTaskEntity } from './api/work.types'

export type WorkViewMode = 'view' | 'edit' | 'create'

export type PossiblyUnsavedWork = Omit<
  PossiblyUnsavedEntity<WorkEntity>,
  'subjectId' | 'tasks'
> & {
  subjectId: string | null
  tasks?: PossiblyUnsavedWorkTask[]
}

export type PossiblyUnsavedWorkTask = PossiblyUnsavedEntity<WorkTaskEntity>
