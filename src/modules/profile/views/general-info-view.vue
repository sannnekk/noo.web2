<template>
  <div class="general-info-view">
    <noo-section
      v-if="profileStore.isStudent"
      title="Мои кураторы"
    >
      <student-mentors-list
        :assignments="profileStore.mentorAssignments.data ?? []"
        :is-loading="profileStore.mentorAssignments.isLoading"
        :error="profileStore.mentorAssignments.error"
        empty-text="У вас пока нет кураторов."
        @retry="profileStore.mentorAssignments.execute(undefined)"
      />
    </noo-section>
    <noo-section
      v-else-if="profileStore.isMentor"
      title="Мои ученики"
    >
      <mentor-students-list
        :assignments="profileStore.studentAssignments.data ?? []"
        :is-loading="profileStore.studentAssignments.isLoading"
        :error="profileStore.studentAssignments.error"
        empty-text="У вас пока нет учеников."
        @retry="profileStore.studentAssignments.execute(undefined)"
      />
    </noo-section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import MentorStudentsList from '@/modules/users/components/mentor-students-list.vue'
import StudentMentorsList from '@/modules/users/components/student-mentors-list.vue'
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
