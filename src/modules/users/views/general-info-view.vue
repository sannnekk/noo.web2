<template>
  <div class="general-info-view">
    <div
      v-if="!userDetailStore.user.data && userDetailStore.user.isLoading"
      class="general-info-view__loading"
    >
      <noo-loader-icon contrast />
    </div>
    <template v-else-if="userDetailStore.user.data">
      <student-mentor-assignments
        v-if="userDetailStore.isStudent"
        :student="userDetailStore.user.data"
      />
      <mentor-student-assignments
        v-else-if="userDetailStore.isMentor"
        :mentor="userDetailStore.user.data"
      />
      <noo-section
        v-if="userDetailStore.isStudent"
        title="Курсы"
        description="Здесь отображаются курсы, на которые ученик был добавлен вручную или через подписку. Прогресс по курсам сохраняется, даже если ученик будет удалён из курса"
      >
        <div class="general-info-view__memberships">
          <course-membership-list
            :memberships="userDetailStore.courseMemberships.data ?? []"
            :is-loading="userDetailStore.courseMemberships.isLoading"
            :has-error="!!userDetailStore.courseMemberships.error"
            :can-manage="canManageCourseMemberships"
            :busy-membership-id="busyMembershipId"
            empty-text="У ученика пока нет курсов"
            @retry="userDetailStore.courseMemberships.execute()"
            @remove="onRemoveMembership"
          />
          <div
            v-if="canManageCourseMemberships"
            class="general-info-view__memberships__actions"
          >
            <noo-button
              variant="secondary"
              size="medium"
              @click="onAddMembership"
            >
              Добавить на курс
            </noo-button>
          </div>
        </div>
      </noo-section>
    </template>
  </div>

  <noo-sure-modal
    v-model:is-open="removeMembershipModal.isOpen.value"
    @confirm="confirmRemoveMembership"
  >
    <template #title>
      <noo-title :size="2">Удалить ученика из курса?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Ученик будет удалён из курса «{{
          removeMembershipModal.courseName.value
        }}». Прогресс по курсу будет сохранён, но доступ к материалам пропадёт.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Удалить </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { CourseMembershipEntity } from '@/modules/courses/api/course.types'
import CourseMembershipList from '../components/course-membership-list.vue'
import MentorStudentAssignments from '../components/mentor-student-assignments.vue'
import StudentMentorAssignments from '../components/student-mentor-assignments.vue'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()
const { can } = useUsersPermissions()

const canManageCourseMemberships = can(UsersPermissions.manageCourseMemberships)

const removeMembershipModal = {
  isOpen: shallowRef(false),
  membershipId: shallowRef<string | null>(null),
  courseName: shallowRef<string>('')
}

const busyMembershipId = computed(() =>
  userDetailStore.unassignCourseMembership.isLoading
    ? removeMembershipModal.membershipId.value
    : null
)

function onRemoveMembership(membership: CourseMembershipEntity): void {
  removeMembershipModal.membershipId.value = membership.id
  removeMembershipModal.courseName.value =
    membership.course?.name ?? membership.courseId
  removeMembershipModal.isOpen.value = true
}

async function confirmRemoveMembership(): Promise<void> {
  if (!removeMembershipModal.membershipId.value) {
    return
  }

  await userDetailStore.unassignCourseMembership.execute(
    removeMembershipModal.membershipId.value
  )
}

function onAddMembership(): void {
  // TODO: open a course-pick modal and call CourseService.createMembership.
}
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

  &__memberships
    display: flex
    flex-direction: column
    gap: 1em

    &__actions
      display: flex
      gap: 0.5em
      flex-wrap: wrap
</style>
