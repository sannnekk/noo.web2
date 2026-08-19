<template>
  <div class="assigned-works-comments-view">
    <noo-title :size="3"> Комментарии к работе </noo-title>
    <noo-text-block
      dimmed
      size="small"
    >
      Комментарии ко всей работе целиком: ученик оставляет свой, пока решает,
      кураторы — пока проверяют. Замечания к отдельным заданиям пишутся в самих
      заданиях.
    </noo-text-block>

    <div class="assigned-works-comments-view__list">
      <rich-comment-block
        v-for="card in cards"
        :key="card.seat"
        :title="card.title"
        :placeholder="card.placeholder"
        :media-category="card.mediaCategory"
        :with-snippets="card.withSnippets"
        :readonly="!card.isEditable"
        :empty-text="card.emptyText"
        :content="card.content"
        @update:content="onUpdate(card, $event)"
      >
        <template
          v-if="card.author"
          #meta
        >
          <noo-text-block
            dimmed
            size="small"
            no-margin
          >
            {{ card.author.name }}
          </noo-text-block>
        </template>
      </rich-comment-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import type { MediaCategory } from '@/modules/media/api/media.types'
import type { UserEntity } from '@/modules/users/api/user.types'
import { computed } from 'vue'
import richCommentBlock from '../components/rich-comment-block.vue'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import type { AssignedWorkCommentSeat } from '../types'

interface SeatPresentation {
  title: string
  placeholder: string
  mediaCategory: MediaCategory
  /** Only mentors have snippets to insert. */
  withSnippets: boolean
}

interface CommentCard extends SeatPresentation {
  seat: AssignedWorkCommentSeat
  author: UserEntity | null | undefined
  content: IRichText | null
  emptyText: string
  isEditable: boolean
}

const SEAT_PRESENTATION: Record<AssignedWorkCommentSeat, SeatPresentation> = {
  student: {
    title: 'Комментарий ученика',
    placeholder: 'Напишите здесь, если хотите что-то сообщить куратору...',
    mediaCategory: 'assigned-work-student-comment-rich-text',
    withSnippets: false
  },
  'main-mentor': {
    title: 'Комментарий проверяющего куратора',
    placeholder: 'Напишите здесь комментарий ко всей работе...',
    mediaCategory: 'assigned-work-mentor-comment-rich-text',
    withSnippets: true
  },
  'helper-mentor': {
    title: 'Комментарий помогающего куратора',
    placeholder: 'Напишите здесь комментарий ко всей работе...',
    mediaCategory: 'assigned-work-mentor-comment-rich-text',
    withSnippets: true
  }
}

const assignedWorkDetailStore = useAssignedWorkDetailStore()

/**
 * A work always has a student; the mentor seats only exist once a mentor has
 * been put on the work.
 */
const cards = computed<CommentCard[]>(() => {
  const work = assignedWorkDetailStore.assignedWork

  if (!work) {
    return []
  }

  const authors: Record<
    AssignedWorkCommentSeat,
    UserEntity | null | undefined
  > = {
    student: work.student,
    'main-mentor': work.mainMentor,
    'helper-mentor': work.helperMentor
  }

  const seats: AssignedWorkCommentSeat[] = ['student']

  if (work.mainMentorId) {
    seats.push('main-mentor')
  }

  if (work.helperMentorId) {
    seats.push('helper-mentor')
  }

  return seats.map((seat) => ({
    ...SEAT_PRESENTATION[seat],
    seat,
    author: authors[seat],
    content: assignedWorkDetailStore.commentOf(seat),
    emptyText: emptyTextFor(seat),
    isEditable:
      assignedWorkDetailStore.canEditOwnComment &&
      assignedWorkDetailStore.ownCommentSeat === seat
  }))
})

/**
 * The mentors' comments only reach the student once the work has been checked,
 * so an empty one before that is not yet written rather than never written.
 */
function emptyTextFor(seat: AssignedWorkCommentSeat): string {
  const isAwaitingCheck =
    seat !== 'student' &&
    assignedWorkDetailStore.ownCommentSeat === 'student' &&
    !assignedWorkDetailStore.workIsChecked

  return isAwaitingCheck
    ? 'Комментарий появится после проверки работы'
    : 'Ещё нет комментария'
}

function onUpdate(card: CommentCard, content: IRichText | null): void {
  if (!card.isEditable) {
    return
  }

  assignedWorkDetailStore.updateComment(content)
}
</script>

<style scoped lang="sass">
.assigned-works-comments-view
  &__list
    display: flex
    flex-direction: column
    gap: var(--space-2xs)
    margin-top: var(--space-2xs)
</style>
