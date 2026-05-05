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
}

defineProps<Props>()

const emit = defineEmits<(e: 'retry') => void>()
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
</style>
