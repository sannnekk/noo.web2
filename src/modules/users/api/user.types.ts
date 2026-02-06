import type { ApiEntity } from '@/core/api/api.types'
import type { UserRole } from '@/core/api/endpoints/auth.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'

export interface UserEntity extends ApiEntity<'User'> {
  username: string
  email: string
  name: string
  telegramId: string | null
  telegramUsername: string | null
  role: UserRole
  isBlocked: boolean
  isVerified: boolean
}

export interface MentorAssignmentEntity extends ApiEntity<'MentorAssignment'> {
  studentId: string
  student?: UserEntity
  mentorId: string
  mentor?: UserEntity
  subjectId: string
  subject?: SubjectEntity
}

export interface CreateMentorAssignmentPayload {
  studentId: string
  mentorId: string
  subjectId: string
}
