<template>
  <div class="general-info-view">
    <div
      v-if="!userDetailStore.user.data && userDetailStore.user.isLoading"
      class="general-info-view__loading"
    >
      <noo-loader-icon contrast />
    </div>
    <noo-section
      v-else-if="userDetailStore.isStudent"
      title="Кураторы"
    >
      <mentor-assignment-list
        :assignments="userDetailStore.mentorAssignments.data ?? []"
        :is-loading="userDetailStore.mentorAssignments.isLoading"
        :has-error="!!userDetailStore.mentorAssignments.error"
        :user-side="'mentor'"
        empty-text="У ученика пока нет кураторов."
        @retry="userDetailStore.mentorAssignments.execute(undefined)"
      />
    </noo-section>
    <noo-section
      v-else-if="userDetailStore.isMentor"
      title="Ученики"
    >
      <mentor-assignment-list
        :assignments="userDetailStore.studentAssignments.data ?? []"
        :is-loading="userDetailStore.studentAssignments.isLoading"
        :has-error="!!userDetailStore.studentAssignments.error"
        :user-side="'student'"
        empty-text="У куратора пока нет учеников."
        @retry="userDetailStore.studentAssignments.execute(undefined)"
      />
    </noo-section>
    <noo-text-block
      v-else
      dimmed
    >
      Для этой роли нет дополнительной информации.
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import MentorAssignmentList from '../components/mentor-assignment-list.vue'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()
</script>

<style scoped lang="sass">
.general-info-view
  display: flex
  flex-direction: column
  gap: 1.5em

  &__loading
    display: flex
    justify-content: center
    font-size: 2em
</style>
