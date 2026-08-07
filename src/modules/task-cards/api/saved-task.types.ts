import type { ApiEntity } from '@/core/api/api.types'
import type { WorkEntity, WorkTaskEntity } from '@/modules/works/api/work.types'

export interface SavedTaskEntity extends ApiEntity<'SavedTask'> {
  taskId: string
  task: WorkTaskEntity
  /**
   * The assigned work the task was saved from. Null once that work is gone.
   */
  assignedWorkId: string | null
  workId: string
  /**
   * The work the task belongs to, with its subject but without its tasks.
   */
  work: WorkEntity | null
}

/**
 * A saved task stripped down to what a work page needs to tell saved tasks from
 * unsaved ones and to unsave them again.
 */
export interface SavedTaskReference {
  id: string
  taskId: string
}

export interface CreateSavedTaskPayload {
  taskId: string
  assignedWorkId: string
}
