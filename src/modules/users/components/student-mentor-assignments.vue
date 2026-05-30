<template>
  <noo-section
    title="Кураторы"
    description="Если при создании или редактировании работы было отмечено, что для нее требуется куратор, то ученик не сможет начать выполнять работу, пока у него не будет назначенного куратора по соответствующему предмету. При назначении, смене или удалении куратора ученик и соответствующий куратор получат уведомление. Если ученик уже выполняет работу, для которой требуется куратор, то этот куратор останется прикрепленным к этой работе, изменение куратора затронет только будущие работы"
  >
    <div class="student-mentor-assignments">
      <student-mentors-list
        :assignments="userDetailStore.mentorAssignments.data ?? []"
        :is-loading="userDetailStore.mentorAssignments.isLoading"
        :error="userDetailStore.mentorAssignments.error"
        empty-text="У ученика пока нет кураторов"
        :can-change="canChange"
        :can-unassign="canUnassign"
        :unassign-label="unassignLabel"
        :busy-assignment-id="busyAssignmentId"
        @retry="userDetailStore.mentorAssignments.execute(undefined)"
        @change="onChange"
        @unassign="onUnassign"
      />
      <div
        v-if="canAdd"
        class="student-mentor-assignments__actions"
      >
        <noo-button
          variant="secondary"
          size="medium"
          @click="onStartAdd"
        >
          {{ addLabel }}
        </noo-button>
      </div>
    </div>
  </noo-section>

  <assign-mentor-modal
    v-if="modalAction"
    v-model:is-open="isModalOpen"
    :action="modalAction"
    :is-loading="userDetailStore.assignMentor.isLoading"
    @submit="onAssignSubmit"
  />

  <noo-sure-modal
    v-model:is-open="unassignModal.isOpen.value"
    @confirm="confirmUnassign"
  >
    <template #title>
      <noo-title :size="2">{{ unassignDialog.title }}</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        {{ unassignDialog.description }}
      </noo-text-block>
    </template>
    <template #confirm-action-text>{{ unassignDialog.confirmLabel }}</template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useCurrentPrincipal } from '@/core/permissions/principal'
import type {
  CreateMentorAssignmentPayload,
  MentorAssignmentEntity,
  UserEntity
} from '../api/user.types'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'
import AssignMentorModal, {
  type AssignMentorAction
} from './assign-mentor-modal.vue'
import StudentMentorsList from './student-mentors-list.vue'

interface Props {
  student: UserEntity
}

const props = defineProps<Props>()

const userDetailStore = useUserDetailStore()
const { can } = useUsersPermissions()
const principal = useCurrentPrincipal()

const canManageAll = can(UsersPermissions.manageMentorAssignments)

function isOwnAssignment(assignment: MentorAssignmentEntity): boolean {
  return assignment.mentorId === principal.value?.id
}

const canAdd = computed(
  () => canManageAll || can(UsersPermissions.selfAssignAsMentor)
)
const addLabel = computed(() =>
  canManageAll ? 'Назначить куратора' : 'Стать куратором этого ученика'
)
const unassignLabel = computed(() =>
  canManageAll ? 'Снять' : 'Перестать быть куратором'
)

function canChange(): boolean {
  return canManageAll
}

function canUnassign(assignment: MentorAssignmentEntity): boolean {
  return canManageAll || isOwnAssignment(assignment)
}

const modalAction = shallowRef<AssignMentorAction | null>(null)
const isModalOpen = computed<boolean>({
  get: () => modalAction.value !== null,
  set: (value) => {
    if (!value) {
      modalAction.value = null
    }
  }
})

function onStartAdd(): void {
  modalAction.value = canManageAll
    ? { kind: 'add', student: props.student }
    : { kind: 'become', student: props.student }
}

function onChange(assignment: MentorAssignmentEntity): void {
  modalAction.value = {
    kind: 'change',
    student: props.student,
    replacing: assignment
  }
}

async function onAssignSubmit(
  payload: CreateMentorAssignmentPayload
): Promise<void> {
  await userDetailStore.assignMentor.execute(payload)

  if (!userDetailStore.assignMentor.error) {
    modalAction.value = null
  }
}

const unassignModal = {
  isOpen: shallowRef(false),
  target: shallowRef<MentorAssignmentEntity | null>(null)
}

const busyAssignmentId = computed(() =>
  userDetailStore.unassignMentor.isLoading
    ? (unassignModal.target.value?.id ?? null)
    : null
)

const unassignDialog = computed<{
  title: string
  description: string
  confirmLabel: string
}>(() => {
  const subjectName = unassignModal.target.value?.subject?.name ?? '—'

  if (canManageAll) {
    return {
      title: 'Снять куратора?',
      description: `Назначение по предмету «${subjectName}» будет удалено. Это действие можно отменить, повторно назначив куратора.`,
      confirmLabel: 'Снять'
    }
  }

  return {
    title: 'Перестать быть куратором?',
    description: `Вы больше не будете курировать этого ученика по предмету «${subjectName}». Это действие можно отменить, повторно назначив себя.`,
    confirmLabel: 'Перестать быть куратором'
  }
})

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
.student-mentor-assignments
  display: flex
  flex-direction: column
  gap: 1em

  &__actions
    display: flex
    gap: 0.5em
    flex-wrap: wrap
</style>
