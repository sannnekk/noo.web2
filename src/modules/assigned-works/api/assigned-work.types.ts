import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { UserEntity } from '@/modules/users/api/user.types'
import type { WorkEntity, WorkType } from '@/modules/works/api/work.types'

/**
 * Represents the solve status of an assigned work.
 */
export type SolveStatus = 'not-solved' | 'in-progress' | 'solved'

/**
 * Represents the check status of an assigned work.
 */
export type CheckStatus = 'not-checked' | 'in-progress' | 'checked'

/**
 * Detailed information about deadline shifts for an assigned work.
 */
export interface DeadlineShiftHistory {
  shiftedAt: Date
  shiftedBy: 'student' | 'mentor'
  reason: string
}

/**
 * Used to give points for parts of the taks.
 * For example:
 * ```json
 * {
 *  "spellcheck": 5,
 *  "grammar": 10
 * }
 * ```
 */
export type DetailedScore = Record<string, number>

/**
 * Shows all the information about the progress of the assigned work.
 */
export interface AssignedWorkProgress {
  assignedWorkId: string
  solveStatus: SolveStatus
  solvedAt: Date | null
  checkStatus: CheckStatus
  checkedAt: Date | null
  score: number | null
  maxScore: number
}

/**
 * Options to remake an assigned work.
 */
export interface AssignedWorkRemakeOptions {
  includeOnlyWrongTasks?: boolean
}

/**
 * Options to add a mentor to an assigned work.
 * If `notify` is true, the new mentor will be notified about the assignment.
 */
export interface AddHelperMentorOptions {
  mentorId: string
  notifyMentor?: boolean
  notifyStudent?: boolean
}

export type AssignedWorkAnswerStatus = 'not-submitted' | 'submitted' | 'checked'

export type AssignedWorkStatusHistoryType =
  | 'created'
  | 'started-solving'
  | 'solve-deadline-shifted'
  | 'solved'
  | 'started-checking'
  | 'check-deadline-shifted'
  | 'checked'
  | 'sent-on-recheck'
  | 'sent-on-resolve'

export interface AssignedWorkStatusHistoryEntity
  extends ApiEntity<'AssignedWorkStatusHistory'> {
  status: AssignedWorkStatusHistoryType
  value: Record<string, string> | null
  changedById: string
  changedBy?: UserEntity | null
  assignedWorkId: string
}

export interface AssignedWorkEntity extends ApiEntity<'AssignedWork'> {
  title: string
  type: WorkType
  attempt: number
  solveStatus: SolveStatus
  solveDeadlineAt: Date | null
  solvedAt: Date | null
  checkStatus: CheckStatus
  checkDeadlineAt: Date | null
  checkedAt: Date | null
  statusHistory: AssignedWorkStatusHistoryEntity[]
  score: number | null
  maxScore: number
  isArchivedByStudent: boolean
  isArchivedByMentors: boolean
  isArchivedByAssistants: boolean
  excludedTaskIds: string[]
  studentCommentId: string | null
  mainMentorCommentId: string | null
  helperMentorCommentId: string | null
  studentComment?: AssignedWorkCommentEntity | null
  mainMentorComment?: AssignedWorkCommentEntity | null
  helperMentorComment?: AssignedWorkCommentEntity | null
  studentId: string
  mainMentorId: string | null
  helperMentorId: string | null
  student?: UserEntity
  mainMentor?: UserEntity | null
  helperMentor?: UserEntity | null
  workId: string | null
  work?: WorkEntity | null
  answers?: AssignedWorkAnswerEntity[]
}

export interface AssignedWorkCommentEntity
  extends ApiEntity<'AssignedWorkComment'> {
  content: IRichText | null
}

export interface AssignedWorkAnswerEntity
  extends ApiEntity<'AssignedWorkAnswer'> {
  richTextContent: IRichText | null
  wordContent: string | null
  taskId: string
  mentorComment: IRichText | null
  score: number | null
  detailedScore: DetailedScore | null
  maxScore: number
  status: AssignedWorkAnswerStatus
}
