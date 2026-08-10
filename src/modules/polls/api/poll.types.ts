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

export interface PollEntity extends ApiEntity<'Poll'> {
  title: string
  description: string | null
  isActive: boolean
  expiresAt: Date | null
  isAuthRequired: boolean
  participationsCount: number
  /**
   * Whether the current user has already answered this poll. Only the API's
   * single-poll endpoint fills this in, and never for a visitor who is not
   * signed in — an anonymous one cannot be recognized before they identify
   * themselves on the auth step.
   */
  hasParticipated: boolean
  questions?: PollQuestionEntity[]
}

export interface PollQuestionEntity extends ApiEntity<'PollQuestion'> {
  /**
   * Position inside the poll. Owned by the client: it is assigned on creation and
   * renumbered on reorder, the API just stores and sorts by it.
   */
  order: number
  title: string
  description: string | null
  isRequired: boolean
  type: PollQuestionType
  config: PollQuestionConfig
}

export interface PollParticipationEntity extends ApiEntity<'PollParticipation'> {
  pollId: string
  poll?: PollEntity
  userType: ParticipatingUserType
  userExternalIdentifier: string | null
  userExternalData: Record<string, unknown> | null
  userId: string | null
  user?: UserEntity | null
  answers?: PollAnswerEntity[]
}

/**
 * The answer itself. The API stores it as an opaque JSON blob, so the question
 * type travels with the value and tells the reader how to interpret it.
 */
export interface PollAnswerValue {
  type: PollQuestionType
  value: unknown
}

export interface PollAnswerEntity extends ApiEntity<'PollAnswer'> {
  pollQuestionId: string
  value: PollAnswerValue
  pollQuestion?: PollQuestionEntity
}

export interface CreatePollAnswerPayload {
  pollQuestionId: string
  value: PollAnswerValue | null
}

export interface CreatePollParticipationPayload {
  userType: ParticipatingUserType
  userExternalIdentifier?: string | null
  userExternalData?: Record<string, unknown> | null
  answers: CreatePollAnswerPayload[]
}

export type PossiblyUnsavedQuestion = PossiblyUnsavedEntity<
  PollQuestionEntity,
  PollQuestionEntity['_entityName']
>

export type PossiblyUnsavedPoll = Omit<
  PossiblyUnsavedEntity<PollEntity, PollEntity['_entityName']>,
  'questions'
> & {
  questions: PossiblyUnsavedQuestion[]
}
