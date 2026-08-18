import type { ApiEntity } from '@/core/api/api.types'
import type { UserRole } from '@/core/api/endpoints/auth.types'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'

export interface UserEntity extends ApiEntity<'User'> {
  username: string
  /** Null for accounts created through a provider that reported no address. */
  email: string | null
  phone: string | null
  name: string
  telegramId: string | null
  telegramUsername: string | null
  role: UserRole
  avatar: UserAvatarEntity | null
  isBlocked: boolean
  isVerified: boolean
  /**
   * Mentors of the user, returned by the user search. Only students have them.
   */
  mentors?: UserMentor[]
}

/**
 * A mentor of a student as listings show them: enough to name the mentor, link
 * to their profile and colour them by subject. The full picture of who is
 * assigned to whom is {@link MentorAssignmentEntity}.
 */
export interface UserMentor {
  /** Id of the mentor, not of the assignment. */
  id: string
  name: string
  subjectName: string | null
  subjectColor: string | null
}

export interface UserAvatarEntity extends ApiEntity<'UserAvatar'> {
  avatarType: UserAvatarType
  avatarUrl: string
  telegramHash?: string | null
  mediaId: string | null
  media: MediaEntity | null
}

export type UserAvatarType = 'telegram' | 'custom' | 'none' | 'external'

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
