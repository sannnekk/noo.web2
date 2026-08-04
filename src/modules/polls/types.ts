import type { ViewMode } from '@/core/composables/useViewMode'
import type { ParticipatingUserType } from './api/poll.types'

export type PollViewMode = ViewMode

/**
 * An answer as the inputs hold it, before it is wrapped into a
 * {@link PollAnswerValue} for the API.
 */
export type PollAnswerInputValue =
  string | number | boolean | Date | string[] | null

/**
 * Who is about to answer the poll. Filled in on the auth step and sent along
 * with the answers.
 */
export interface PollParticipant {
  userType: ParticipatingUserType
  /** Identifier of the participant in the external system, e.g. a Telegram id. */
  externalIdentifier?: string | null
  externalData?: Record<string, unknown> | null
  /** Name shown while filling the poll in, purely cosmetic. */
  displayName?: string | null
}

/**
 * A user-facing group of MIME types allowed as an answer to a `files` question.
 * The API stores plain MIME types, see `pollFileTypeGroups` for the mapping.
 */
export type PollFileTypeGroup = 'images' | 'documents'
