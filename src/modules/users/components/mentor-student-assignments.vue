<template>
  <noo-section
    title="Ученики"
    description="Здесь отображаются ученики куратора. Куратор может назначать или снимать учеников только для себя, преподаватели и администраторы могут управлять учениками всех кураторов"
  >
    <div class="mentor-student-assignments">
      <mentor-students-list
        :assignments="userDetailStore.studentAssignments.data ?? []"
        :is-loading="userDetailStore.studentAssignments.isLoading"
        :error="userDetailStore.studentAssignments.error"
        empty-text="У куратора пока нет учеников"
        :can-unassign="canUnassign"
        :busy-assignment-id="busyAssignmentId"
        @retry="userDetailStore.studentAssignments.execute(undefined)"
        @unassign="onUnassign"
      />
      <div
        v-if="canAct"
        class="mentor-student-assignments__actions"
      >
        <noo-button
          variant="secondary"
          size="medium"
          @click="isAddModalOpen = true"
        >
          Добавить ученика
        </noo-button>
      </div>
    </div>
  </noo-section>

  <add-student-modal
    v-model:is-open="isAddModalOpen"
    :mentor="mentor"
    :is-loading="userDetailStore.assignMentor.isLoading"
    @submit="onAssignSubmit"
  />

  <noo-sure-modal
    v-model:is-open="unassignModal.isOpen.value"
    @confirm="confirmUnassign"
  >
    <template #title>
      <noo-title :size="2">Снять ученика?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Назначение по предмету «{{ subjectName }}» будет удалено. Это действие
        можно отменить, повторно добавив ученика.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Снять </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useAuthStore } from '@/core/stores/auth.store'
import type {
  CreateMentorAssignmentPayload,
  MentorAssignmentEntity,
  UserEntity
} from '../api/user.types'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'
import AddStudentModal from './add-student-modal.vue'
import MentorStudentsList from './mentor-students-list.vue'

interface Props {
  mentor: UserEntity
}

const props = defineProps<Props>()

const userDetailStore = useUserDetailStore()
const authStore = useAuthStore()
const { can } = useUsersPermissions()

const canManageAll = can(UsersPermissions.manageMentorAssignments)
const canSelfAssignRole = can(UsersPermissions.selfAssignAsMentor)

const isCurrentUserMentor = computed(
  () => authStore.userInfo?.role === 'mentor'
)
const isOwnProfile = computed(
  () => !!authStore.userInfo && authStore.userInfo.id === props.mentor.id
)
const canSelfAssign = computed(
  () => canSelfAssignRole && isCurrentUserMentor.value && isOwnProfile.value
)

const canAct = computed(() => canManageAll || canSelfAssign.value)

function canUnassign(): boolean {
  return canAct.value
}

const isAddModalOpen = shallowRef(false)

async function onAssignSubmit(
  payload: CreateMentorAssignmentPayload
): Promise<void> {
  await userDetailStore.assignMentor.execute(payload)

  if (!userDetailStore.assignMentor.error) {
    isAddModalOpen.value = false
  }
}

const unassignModal = {
  isOpen: shallowRef(false),
  target: shallowRef<MentorAssignmentEntity | null>(null)
}

const subjectName = computed(
  () => unassignModal.target.value?.subject?.name ?? '—'
)

const busyAssignmentId = computed(() =>
  userDetailStore.unassignMentor.isLoading
    ? (unassignModal.target.value?.id ?? null)
    : null
)

function onUnassign(assignment: MentorAssignmentEntity): void {
  unassignModal.target.value = assignment
  unassignModal.isOpen.value = true
}

async function confirmUnassign(): Promise<void> {
  const target = unassignModal.target.value

  if (!target) {
    return
  }

  await userDetailStore.unassignMentor.execute(target.id)
}
</script>

<style scoped lang="sass">
.mentor-student-assignments
  display: flex
  flex-direction: column
  gap: 1em

  &__actions
    display: flex
    gap: 0.5em
    flex-wrap: wrap
</style>
