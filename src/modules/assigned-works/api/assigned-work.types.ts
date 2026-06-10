import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { UserEntity } from '@/modules/users/api/user.types'
import type { WorkEntity, WorkType } from '@/modules/works/api/work.types'

export type SolveStatus = 'not-solved' | 'in-progress' | 'solved'

export type CheckStatus = 'not-checked' | 'in-progress' | 'checked'

export interface DeadlineShiftHistory {
  shiftedAt: Date
  shiftedBy: 'student' | 'mentor'
  reason: string
}

export type DetailedScore = Record<string, number>

export interface AssignedWorkProgress {
  assignedWorkId: string
  solveStatus: SolveStatus
  solvedAt: Date | null
  checkStatus: CheckStatus
  checkedAt: Date | null
  score: number | null
  attempt: number
  maxScore: number
  createdAt: Date
}

export interface AssignedWorkRemakeOptions {
  includeOnlyWrongTasks?: boolean
}

export interface AddHelperMentorOptions {
  mentorId: string
  notifyMentor?: boolean
  notifyStudent?: boolean
}

export interface ReplaceMainMentorOptions {
  mentorId: string
  notifyMentor?: boolean
  notifyStudent?: boolean
}

export interface ShiftAssignedWorkDeadlineOptions {
  newDeadline: Date
  notifyOthers?: boolean
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

export interface AssignedWorkHistoryEntity extends ApiEntity<'AssignedWorkStatusHistory'> {
  type: AssignedWorkStatusHistoryType
  value: Record<string, string> | null
  changedAt: Date
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
  statusHistory: AssignedWorkHistoryEntity[]
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

export interface AssignedWorkCommentEntity extends ApiEntity<'AssignedWorkComment'> {
  content: IRichText | null
}

export interface AssignedWorkAnswerEntity extends ApiEntity<'AssignedWorkAnswer'> {
  richTextContent: IRichText | null
  wordContent: string | null
  taskId: string
  mentorComment: IRichText | null
  score: number | null
  detailedScore: DetailedScore | null
  maxScore: number
  status: AssignedWorkAnswerStatus
}

export interface UpsertAssignedWorkAnswerDto {
  id?: string
  richTextContent?: IRichText
  wordContent?: string | null
  mentorComment?: IRichText
  score?: number | null
  maxScore: number
  detailedScore?: DetailedScore | null
  status: AssignedWorkAnswerStatus
  taskId: string
}

export interface UpsertAssignedWorkCommentDto {
  id?: string
  content?: IRichText
}

export interface IdResponseDto {
  id: string
}

export interface AssignedWorksMetadata {
  counts: {
    all: number
    notSolved: number
    notChecked: number
    checked: number
  }
}
