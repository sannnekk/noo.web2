<template>
  <div class="mentor-assignment-list">
    <div
      v-if="isLoading"
      class="mentor-assignment-list__loading"
    >
      <noo-loader-icon contrast />
    </div>
    <noo-error-block
      v-else-if="hasError"
      no-margin
      :try-again="() => emit('retry')"
    >
      Не удалось загрузить список.
    </noo-error-block>
    <noo-text-block
      v-else-if="!assignments.length"
      dimmed
      no-margin
    >
      {{ emptyText }}
    </noo-text-block>
    <ul
      v-else
      class="mentor-assignment-list__items"
    >
      <li
        v-for="assignment in assignments"
        :key="assignment.id"
        class="mentor-assignment-list__item"
      >
        <noo-subject-block
          class="mentor-assignment-list__item__subject"
          :subject="assignment.subject ?? null"
        />
        <noo-inline-user-card
          class="mentor-assignment-list__item__user"
          :user="userSide === 'mentor' ? assignment.mentor : assignment.student"
        />
        <div
          v-if="canChange || canUnassign(assignment)"
          class="mentor-assignment-list__item__actions"
        >
          <noo-button
            v-if="canChange"
            variant="inline"
            size="small"
            :disabled="busyAssignmentId === assignment.id"
            @click="emit('change', assignment)"
          >
            Сменить
          </noo-button>
          <noo-button
            v-if="canUnassign(assignment)"
            variant="danger-inline"
            size="small"
            :is-loading="busyAssignmentId === assignment.id"
            @click="emit('unassign', assignment)"
          >
            Снять
          </noo-button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { MentorAssignmentEntity } from '../api/user.types'

interface Props {
  assignments: MentorAssignmentEntity[]
  isLoading: boolean
  hasError: boolean
  /**
   * Which side of the assignment to display as the user.
   * 'mentor' — show the mentor (used on a student's profile).
   * 'student' — show the student (used on a mentor's profile).
   */
  userSide: 'mentor' | 'student'
  emptyText: string
  /**
   * Whether the current user can change the mentor for an assignment.
   * Only meaningful on a student's profile.
   */
  canChange?: boolean
  /**
   * The current user's id, used to determine self-managed rows when the
   * caller cannot fully manage assignments.
   */
  currentUserId?: string | null
  /**
   * Whether the current user can fully manage all assignments
   * (admin/teacher). When false, only own rows are unassignable.
   */
  canManageAll?: boolean
  /**
   * Assignment id currently being mutated, used to disable its actions.
   */
  busyAssignmentId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  canChange: false,
  currentUserId: null,
  canManageAll: false,
  busyAssignmentId: null
})

const emit = defineEmits<Emits>()

interface Emits {
  (e: 'retry'): void
  (e: 'change', assignment: MentorAssignmentEntity): void
  (e: 'unassign', assignment: MentorAssignmentEntity): void
}

function canUnassign(assignment: MentorAssignmentEntity): boolean {
  if (props.canManageAll) {
    return true
  }

  return !!props.currentUserId && assignment.mentorId === props.currentUserId
}
</script>

<style scoped lang="sass">
.mentor-assignment-list
  &__loading
    display: flex
    justify-content: center
    font-size: 2em

  &__items
    list-style: none
    padding: 0
    margin: 0
    display: flex
    flex-direction: column
    gap: 0.5em

  &__item
    display: flex
    align-items: center
    gap: 1em
    flex-wrap: wrap

    &__subject
      flex-shrink: 0

    &__user
      flex: 1 1 auto

    &__actions
      display: flex
      gap: 0.25em
      flex-shrink: 0
</style>
