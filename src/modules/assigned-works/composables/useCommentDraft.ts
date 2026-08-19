import { getPrincipal } from '@/core/permissions/principal'
import { uid } from '@/core/utils/id.utils'
import type { IRichText } from '@/core/utils/richtext.utils'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type {
  AssignedWorkCommentEntity,
  AssignedWorkEntity
} from '../api/assigned-work.types'
import type { AssignedWorkCommentSeat, PossiblyUnsavedComment } from '../types'

export interface UseCommentDraftReturn {
  /** The current user's own comment on the work, as they are writing it. */
  draft: Ref<PossiblyUnsavedComment>
  /** Which of the work's three comments is the current user's, if any. */
  seat: ComputedRef<AssignedWorkCommentSeat | null>
  hasChanges: ComputedRef<boolean>
  /** The comment of one seat as it should be shown. */
  contentOf: (seat: AssignedWorkCommentSeat) => IRichText | null
  update: (content: IRichText | null) => void
  /** Seeds the draft from the comment the user has already written on this work. */
  seed: () => void
  /** Marks the draft stored, under the id the server gave it. */
  markSaved: (commentId: string | undefined) => void
  reset: () => void
}

function createDraft(): PossiblyUnsavedComment {
  return {
    _entityName: 'AssignedWorkComment',
    _key: uid(),
    _status: 'empty',
    content: null
  }
}

/**
 * The one comment on the work as a whole that belongs to the current user. Which
 * one that is follows from the seat they hold on the work — student, main mentor
 * or helper mentor — the same way the server decides it. Everyone else's comments
 * are read straight off the work and never edited here.
 *
 * @param currentWork The work being worked on, or undefined before one is loaded.
 * @param onChange Called on every user edit, so the store can start its autosave clock.
 */
function useCommentDraft(
  currentWork: () => AssignedWorkEntity | undefined,
  onChange: () => void
): UseCommentDraftReturn {
  const draft = ref<PossiblyUnsavedComment>(createDraft())

  const hasChanges = computed<boolean>(() => draft.value._status === 'modified')

  /**
   * Null for anyone only looking on — an admin, a teacher, an assistant — who
   * therefore has no comment of their own to write.
   */
  const seat = computed<AssignedWorkCommentSeat | null>(() => {
    const principal = getPrincipal()
    const work = currentWork()

    if (!principal || !work) {
      return null
    }

    if (work.studentId === principal.id) {
      return 'student'
    }

    if (work.mainMentorId === principal.id) {
      return 'main-mentor'
    }

    if (work.helperMentorId === principal.id) {
      return 'helper-mentor'
    }

    return null
  })

  /** The comment stored on the work for one seat, as it was last loaded. */
  function storedAt(
    which: AssignedWorkCommentSeat
  ): AssignedWorkCommentEntity | null | undefined {
    const work = currentWork()

    switch (which) {
      case 'student':
        return work?.studentComment
      case 'main-mentor':
        return work?.mainMentorComment
      case 'helper-mentor':
        return work?.helperMentorComment
    }
  }

  /**
   * The user's own comment comes from the draft they are editing, everyone
   * else's from the work as it was loaded.
   */
  function contentOf(which: AssignedWorkCommentSeat): IRichText | null {
    return which === seat.value
      ? draft.value.content
      : (storedAt(which)?.content ?? null)
  }

  function update(content: IRichText | null): void {
    draft.value = { ...draft.value, content, _status: 'modified' }
    onChange()
  }

  function seed(): void {
    const stored = seat.value ? storedAt(seat.value) : null

    draft.value = stored
      ? { ...stored, _key: stored.id, _status: 'saved' }
      : createDraft()
  }

  function markSaved(commentId: string | undefined): void {
    draft.value = {
      ...draft.value,
      id: commentId ?? draft.value.id,
      _status: 'saved'
    }
  }

  function reset(): void {
    draft.value = createDraft()
  }

  return {
    draft,
    seat,
    hasChanges,
    contentOf,
    update,
    seed,
    markSaved,
    reset
  }
}

export { useCommentDraft }
