import type { ApiEntity } from '@/core/api/api.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
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

/**
 * One subject a student has saved tasks on. What a quiz is set up from: which
 * subjects are on offer and which hold enough cards to run.
 */
export interface SavedTaskSubjectSummary {
  /** Null for tasks whose work has no subject. */
  subject: SubjectEntity | null
  savedTaskCount: number
}

/**
 * The verdict on one quiz answer, scored by the same checker that scored the
 * work the task came from.
 */
export interface SavedTaskAnswerCheck {
  score: number
  maxScore: number
  isCorrect: boolean
}

export interface QuizDeckOptions {
  /** Null draws from every subject. */
  subjectId: string | null
  count: number
}
