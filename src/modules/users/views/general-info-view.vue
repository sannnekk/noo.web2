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
      <div class="general-info-view__assignments">
        <mentor-assignment-list
          :assignments="userDetailStore.mentorAssignments.data ?? []"
          :is-loading="userDetailStore.mentorAssignments.isLoading"
          :has-error="!!userDetailStore.mentorAssignments.error"
          :user-side="'mentor'"
          empty-text="У ученика пока нет кураторов."
          :can-change="canManageAll"
          :can-manage-all="canManageAll"
          :current-user-id="currentUserId"
          :busy-assignment-id="busyAssignmentId"
          @retry="userDetailStore.mentorAssignments.execute(undefined)"
          @change="onChangeMentor"
          @unassign="onUnassign"
        />
        <div
          v-if="canAddOnStudent"
          class="general-info-view__assignments__actions"
        >
          <noo-button
            v-if="canManageAll"
            variant="secondary"
            size="medium"
            @click="openAssignModal('manage')"
          >
            Назначить куратора
          </noo-button>
          <noo-button
            v-if="canSelfAssign && !canManageAll"
            variant="secondary"
            size="medium"
            @click="openAssignModal('self')"
          >
            Назначить себя
          </noo-button>
        </div>
      </div>
    </noo-section>
    <noo-section
      v-else-if="userDetailStore.isMentor"
      title="Ученики"
    >
      <div class="general-info-view__assignments">
        <mentor-assignment-list
          :assignments="userDetailStore.studentAssignments.data ?? []"
          :is-loading="userDetailStore.studentAssignments.isLoading"
          :has-error="!!userDetailStore.studentAssignments.error"
          :user-side="'student'"
          empty-text="У куратора пока нет учеников."
          :can-manage-all="canManageAll"
          :current-user-id="currentUserId"
          :busy-assignment-id="busyAssignmentId"
          @retry="userDetailStore.studentAssignments.execute(undefined)"
          @unassign="onUnassign"
        />
        <div
          v-if="canAddOnMentor"
          class="general-info-view__assignments__actions"
        >
          <noo-button
            variant="secondary"
            size="medium"
            @click="openAssignModal('add-student')"
          >
            Добавить ученика
          </noo-button>
        </div>
      </div>
    </noo-section>
    <noo-text-block
      v-else
      dimmed
    >
      Для этой роли нет дополнительной информации.
    </noo-text-block>
  </div>

  <mentor-assignment-modal
    v-if="user && assignModal.isOpen.value"
    v-model:is-open="assignModal.isOpen.value"
    :mode="
      assignModal.mode.value === 'add-student' ? 'pick-student' : 'pick-mentor'
    "
    :anchor-user="user"
    :fixed-mentor-id="assignModal.fixedMentorId.value"
    :title="assignModalTitle"
    :description="assignModalDescription"
    :submit-label="assignModalSubmitLabel"
    :is-loading="userDetailStore.assignMentor.isLoading"
    @submit="onAssignSubmit"
  />

  <noo-sure-modal
    v-model:is-open="unassignModal.isOpen.value"
    @confirm="confirmUnassign"
  >
    <template #title>
      <noo-title :size="2">Снять куратора?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Назначение по предмету «{{ unassignModal.subjectName.value }}» будет
        удалено. Это действие можно отменить, повторно назначив куратора.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Снять </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth.store'
import { computed, shallowRef } from 'vue'
import type {
  CreateMentorAssignmentPayload,
  MentorAssignmentEntity
} from '../api/user.types'
import MentorAssignmentList from '../components/mentor-assignment-list.vue'
import MentorAssignmentModal from '../components/mentor-assignment-modal.vue'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()
const authStore = useAuthStore()
const { can } = useUsersPermissions()

const user = computed(() => userDetailStore.user.data)
const currentUserId = computed(() => authStore.userInfo?.id ?? null)
const currentUser = computed(() => authStore.userInfo ?? null)

const canManageAll = can(UsersPermissions.manageMentorAssignments)
const canSelfAssignRole = can(UsersPermissions.selfAssignAsMentor)

const isCurrentUserMentor = computed(() => currentUser.value?.role === 'mentor')

const canSelfAssign = computed(
  () => canSelfAssignRole && isCurrentUserMentor.value
)

const canAddOnStudent = computed(() => canManageAll || canSelfAssign.value)

const canAddOnMentor = computed(() => {
  if (canManageAll) {
    return true
  }

  // Mentor on their own profile can add students.
  return canSelfAssign.value && user.value?.id === currentUserId.value
})

type AssignMode = 'manage' | 'self' | 'add-student'

const assignModal = {
  isOpen: shallowRef(false),
  mode: shallowRef<AssignMode>('manage'),
  fixedMentorId: shallowRef<string | null>(null),
  changingAssignmentId: shallowRef<string | null>(null)
}

const assignModalTitle = computed(() => {
  switch (assignModal.mode.value) {
    case 'self':
      return 'Назначить себя куратором'
    case 'add-student':
      return 'Добавить ученика'
    case 'manage':
    default:
      return assignModal.changingAssignmentId.value
        ? 'Сменить куратора'
        : 'Назначить куратора'
  }
})

const assignModalDescription = computed(() => {
  if (assignModal.mode.value === 'add-student') {
    return 'Выберите ученика и предмет, по которому вы будете его курировать.'
  }

  return 'Если по выбранному предмету уже есть куратор, он будет заменён.'
})

const assignModalSubmitLabel = computed(() =>
  assignModal.changingAssignmentId.value ? 'Сменить' : 'Назначить'
)

function openAssignModal(mode: AssignMode): void {
  assignModal.mode.value = mode
  assignModal.changingAssignmentId.value = null
  assignModal.fixedMentorId.value =
    mode === 'self' ? (currentUserId.value ?? null) : null
  assignModal.isOpen.value = true
}

function onChangeMentor(assignment: MentorAssignmentEntity): void {
  assignModal.mode.value = 'manage'
  assignModal.changingAssignmentId.value = assignment.id
  assignModal.fixedMentorId.value = null
  assignModal.isOpen.value = true
}

async function onAssignSubmit(
  payload: CreateMentorAssignmentPayload
): Promise<void> {
  await userDetailStore.assignMentor.execute(payload)

  if (!userDetailStore.assignMentor.error) {
    assignModal.isOpen.value = false
    assignModal.changingAssignmentId.value = null
  }
}

const unassignModal = {
  isOpen: shallowRef(false),
  assignmentId: shallowRef<string | null>(null),
  subjectName: shallowRef<string>('')
}

const busyAssignmentId = computed(() =>
  userDetailStore.unassignMentor.isLoading
    ? unassignModal.assignmentId.value
    : null
)

function onUnassign(assignment: MentorAssignmentEntity): void {
  unassignModal.assignmentId.value = assignment.id
  unassignModal.subjectName.value = assignment.subject?.name ?? '—'
  unassignModal.isOpen.value = true
}

async function confirmUnassign(): Promise<void> {
  if (!unassignModal.assignmentId.value) {
    return
  }

  await userDetailStore.unassignMentor.execute(unassignModal.assignmentId.value)
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

  &__assignments
    display: flex
    flex-direction: column
    gap: 1em

    &__actions
      display: flex
      gap: 0.5em
      flex-wrap: wrap
</style>
