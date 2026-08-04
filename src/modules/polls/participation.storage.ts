import { LocalStorage } from '@/core/utils/local-storage.utils'
import type { PollAnswerInputValue } from './types'

/**
 * How long a draft outlives the tab it was typed in. The clock is reset on
 * every save, so it is an hour of inactivity rather than an hour of filling the
 * poll in.
 */
const DRAFT_TTL_MS = 60 * 60 * 1000

/**
 * Whose draft it is. Drafts are cleared when a session ends, but a shared
 * browser is not something to be trusted twice: keying them by owner as well
 * means answers of one account are never handed to another, even if the clear
 * never ran (an expired session, a closed tab, a crash).
 */
const ANONYMOUS_OWNER = 'guest'

/**
 * Answers as they were left, keyed by question id. What is stored is the raw
 * input value — the poll it belongs to may have changed in the meantime, so a
 * draft is a suggestion to be checked against the questions, not a truth.
 */
type PollAnswersDraft = Record<string, PollAnswerInputValue>

function draftKey(pollId: string, ownerId?: string): string {
  return `poll-answers:${ownerId ?? ANONYMOUS_OWNER}:${pollId}`
}

function readDraft(pollId: string, ownerId?: string): PollAnswersDraft | null {
  const draft = LocalStorage.get<PollAnswersDraft>(draftKey(pollId, ownerId), {
    // Date answers go in as `Date` objects and have to come back as such.
    withDates: true
  })

  if (!draft || typeof draft !== 'object') {
    return null
  }

  return draft
}

function saveDraft(
  pollId: string,
  answers: PollAnswersDraft,
  ownerId?: string
): void {
  LocalStorage.set(draftKey(pollId, ownerId), answers, { ttl: DRAFT_TTL_MS })
}

function clearDraft(pollId: string, ownerId?: string): void {
  LocalStorage.remove(draftKey(pollId, ownerId))
}

export {
  ANONYMOUS_OWNER,
  clearDraft,
  DRAFT_TTL_MS,
  readDraft,
  saveDraft,
  type PollAnswersDraft
}
