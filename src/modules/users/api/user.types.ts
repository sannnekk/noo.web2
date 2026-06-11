import type { ApiEntity } from '@/core/api/api.types'
import type { UserRole } from '@/core/api/endpoints/auth.types'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'

export interface UserEntity extends ApiEntity<'User'> {
  username: string
  email: string
  phone: string | null
  name: string
  telegramId: string | null
  telegramUsername: string | null
  role: UserRole
  avatar: UserAvatarEntity | null
  isBlocked: boolean
  isVerified: boolean
}

export interface UserAvatarEntity extends ApiEntity<'UserAvatar'> {
  avatarType: UserAvatarType
  avatarUrl: string
  telegramHash?: string | null
  mediaId: string | null
  media: MediaEntity | null
}

export type UserAvatarType = 'telegram' | 'custom' | 'none'

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
