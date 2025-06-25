import type { ApiEntity } from '@/core/api/api.types'
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type { UserEntity } from '@/modules/users/api/user.types'

export type PollQuestionType =
  | 'checkbox'
  | 'single-choice'
  | 'multiple-choice'
  | 'text'
  | 'number'
  | 'date'
  | 'date-time'
  | 'rating'
  | 'files'

export type ParticipatingUserType = 'authenticated-user' | 'telegram-user'

export interface PollQuestionConfig {
  minChoices?: number | null
  maxChoices?: number | null
  minTextLength?: number | null
  maxTextLength?: number | null
  minIntValue?: number | null
  maxIntValue?: number | null
  minRating?: number | null
  maxRating?: number | null
  options?: string[]
  /**
   * Maximum file size in bytes
   */
  maxFileSize?: number | null
  /**
   * Allowed file types (MIME types)
   */
  allowedFileTypes?: string[] | null
  maxFileCount?: number | null
}

export interface PollEntity extends ApiEntity {
  title: string
  description: string | null
  isActive: boolean
  questions?: PollQuestionEntity[]
}

export interface PollQuestionEntity extends ApiEntity {
  title: string
  description: string | null
  isRequired: boolean
  type: PollQuestionType
  config: PollQuestionConfig
}

export interface PollParticipationEntity extends ApiEntity {
  pollId: string
  poll?: PollEntity
  userType: ParticipatingUserType
  userExternalIdentifier: string | null
  userExternalData: Record<string, unknown> | null
  userId: string | null
  user?: UserEntity | null
  answers?: PollAnswerEntity[]
}

export interface PollAnswerEntity extends ApiEntity {
  pollQuestionId: string
  value: {
    type: PollQuestionType
    value: unknown
  }
  pollQuestion?: PollQuestionEntity
}

export type PossiblyUnsavedQuestion = PossiblyUnsavedEntity<PollQuestionEntity>

export type PossiblyUnsavedPoll = Omit<
  PossiblyUnsavedEntity<PollEntity>,
  'questions'
> & {
  questions: PossiblyUnsavedQuestion[]
}
