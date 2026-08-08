import type { ApiEntity } from '@/core/api/api.types'
import type { UserEntity } from './user.types'

export type UserHistoryType =
  // Account lifecycle
  | 'registered'
  | 'email-confirmed'
  | 'email-changed'
  | 'password-changed'
  | 'password-reset'
  | 'profile-updated'
  // Administrative actions
  | 'role-changed'
  | 'blocked'
  | 'unblocked'
  | 'verified'
  // Courses and mentors
  | 'added-to-course'
  | 'removed-from-course'
  | 'mentor-assigned'
  | 'mentor-unassigned'
  // Assigned works
  | 'work-assigned'
  | 'work-solved'
  | 'work-checked'
  | 'work-sent-on-recheck'
  | 'work-sent-on-resolve'

/**
 * Which side of an entry the user being viewed is on: what happened to them,
 * or what they did to others.
 */
export type UserHistoryPerspective = 'subject' | 'actor'

export interface UserHistoryEntity extends ApiEntity<'UserHistory'> {
  type: UserHistoryType
  subjectUserId: string
  actorUserId: string | null
  /**
   * Display data captured when the entry was written, so it stays readable after
   * whatever it refers to is renamed or deleted. Keys depend on `type`.
   */
  payload: Record<string, string> | null
  actor?: UserEntity | null
}
