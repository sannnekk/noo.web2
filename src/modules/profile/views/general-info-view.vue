<template>
  <div class="general-info-view">
    <noo-section
      v-if="profileStore.isStudent"
      title="Мои кураторы"
    >
      <mentor-assignment-list
        :assignments="profileStore.mentorAssignments.data ?? []"
        :is-loading="profileStore.mentorAssignments.isLoading"
        :has-error="!!profileStore.mentorAssignments.error"
        user-side="mentor"
        empty-text="У вас пока нет кураторов."
        @retry="profileStore.mentorAssignments.execute(undefined)"
      />
    </noo-section>
    <noo-section
      v-else-if="profileStore.isMentor"
      title="Мои ученики"
    >
      <mentor-assignment-list
        :assignments="profileStore.studentAssignments.data ?? []"
        :is-loading="profileStore.studentAssignments.isLoading"
        :has-error="!!profileStore.studentAssignments.error"
        user-side="student"
        empty-text="У вас пока нет учеников."
        @retry="profileStore.studentAssignments.execute(undefined)"
      />
    </noo-section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import MentorAssignmentList from '@/modules/users/components/mentor-assignment-list.vue'
import { useProfileStore } from '../stores/profile.store'

const profileStore = useProfileStore()

onMounted(() => {
  profileStore.loadAssignments()
})
</script>

<style scoped lang="sass">
.general-info-view
  display: flex
  flex-direction: column
  gap: 1.5em
</style>
