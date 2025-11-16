<template>
  <div class="assigned-work-actions">
    <noo-button
      v-for="action in availableActions"
      :key="action.key"
      class="assigned-work-actions__action"
      :class="{
        'assigned-work-actions__action--medium': action.size === 'medium',
        'assigned-work-actions__action--large': action.size === 'large'
      }"
      :size="action.size"
      :variant="action.variant"
      @click="action.handler"
    >
      {{ action.label }}
    </noo-button>
  </div>

  <!-- Before marked solved modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeMarkSolved.isOpen.value"
    @confirm="assignedWorkDetailStore.markSolved.execute()"
  >
    <template #title>
      <noo-title :size="2"> Вы уверены, что хотите сдать работу? </noo-title>
      <noo-warning-block v-if="!assignedWorkDetailStore.allTasksAreSolved">
        Вы не ответили на все вопросы в работе.
      </noo-warning-block>
    </template>
    <template #content>
      <noo-text-block dimmed>
        После этого вы не сможете внести изменения.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- Before marked checked modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeMarkChecked.isOpen.value"
    @confirm="assignedWorkDetailStore.markChecked.execute()"
  >
    <template #title>
      <noo-title :size="2">
        Вы уверены, что хотите отправить работу на проверку?
      </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        После этого вы не сможете внести изменения.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- Before remake modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeRemake.isOpen.value"
    @confirm="
      assignedWorkDetailStore.remake.execute(modals.beforeRemake.options.value)
    "
  >
    <template #title>
      <noo-title :size="2"> Переделать работу </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Эта работа не изменится, будет создан новый экземпляр работы в списке
        работ.
      </noo-text-block>
      <noo-checkbox
        v-model="modals.beforeRemake.options.value.includeOnlyWrongTasks"
      >
        <noo-text-block dimmed>
          Включить в новую работу только задания с неправильными ответами
        </noo-text-block>
      </noo-checkbox>
    </template>
  </noo-sure-modal>

  <!-- Before shift solve deadline modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeShiftSolveDeadline.isOpen.value"
    @confirm="assignedWorkDetailStore.shiftSolveDeadline.execute()"
  >
    <template #title>
      <noo-title :size="2"> Сдвинуть дедлайн </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Дедлайн сдачи работы будет сдвинут на
        {{ AssignedWorkConfig.solveDeadlineShiftText }}.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- Before shift check deadline modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeShiftCheckDeadline.isOpen.value"
    @confirm="assignedWorkDetailStore.shiftCheckDeadline.execute()"
  >
    <template #title>
      <noo-title :size="2"> Сдвинуть дедлайн проверки </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Дедлайн проверки работы будет сдвинут на
        {{ AssignedWorkConfig.checkDeadlineShiftText }}.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- Before add helper mentor modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeAddHelperMentor.isOpen.value"
    @confirm="
      assignedWorkDetailStore.addHelperMentor.execute(
        modals.beforeAddHelperMentor.options.value
      )
    "
  >
    <template #title>
      <noo-title :size="2"> Добавить помогающего куратора </noo-title>
    </template>
    <template #content>
      <!-- TODO: add mentor select -->
      <noo-text-block dimmed>
        Выберите куратора, который будет помогать в проверке работы.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- Before mark unsolved modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeMarkUnsolved.isOpen.value"
    @confirm="assignedWorkDetailStore.markUnsolved.execute()"
  >
    <template #title>
      <noo-title :size="2"> Отправить на доработку </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Работа будет отправлена на доработку, ученик сможет продолжить ее
        выполнение.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- Before mark unchecked modal -->
  <noo-sure-modal
    v-model:is-open="modals.beforeMarkUnchecked.isOpen.value"
    @confirm="assignedWorkDetailStore.markUnchecked.execute()"
  >
    <template #title>
      <noo-title :size="2"> Отменить проверку </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Работа будет отмечена как не проверенная, вы сможете продолжить
        проверку. Сохраненные комментарии и баллы не будут удалены.
      </noo-text-block>
    </template>
  </noo-sure-modal>

  <!-- History modal -->
  <history-modal
    v-if="assignedWorkDetailStore.assignedWork"
    v-model:is-open="modals.history.isOpen.value"
    :assigned-work-id="assignedWorkDetailStore.assignedWork.id"
  />
</template>

<script setup lang="ts">
import type {
  ButtonSize,
  ButtonType
} from '@/components/buttons/noo-button.vue'
import { useAuthStore } from '@/core/stores/auth.store'
import { computed, ref, shallowRef } from 'vue'
import type { AddHelperMentorOptions } from '../api/assigned-work.types'
import { type AssignedWorkRemakeOptions } from '../api/assigned-work.types'
import { AssignedWorkConfig } from '../config'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import historyModal from './history-modal.vue'

interface AssignedWorkAction {
  key: string
  if: () => boolean
  size: ButtonSize
  variant: ButtonType
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: () => any
}

const authStore = useAuthStore()
const assignedWorkDetailStore = useAssignedWorkDetailStore()

const { workIsSolved, workIsChecked, workIsRemakeable } =
  assignedWorkDetailStore
const isStudent = authStore.roleIsOneOf(['student'])
const isMentor = authStore.roleIsOneOf(['mentor'])

const actions: AssignedWorkAction[] = [
  {
    key: 'submit-work',
    if: () => !workIsSolved && isStudent,
    size: 'large',
    variant: 'primary',
    label: 'Сдать работу',
    handler: () => (modals.beforeMarkSolved.isOpen.value = true)
  },
  {
    key: 'save-state',
    if: () => !workIsSolved && isStudent,
    size: 'medium',
    variant: 'tertiary',
    label: 'Сохранить без сдачи',
    handler: () => assignedWorkDetailStore.save()
  },
  {
    key: 'shift-solve-deadline',
    if: () => !workIsSolved && isStudent,
    size: 'medium',
    variant: 'tertiary',
    label: 'Сдвинуть дедлайн',
    handler: () => (modals.beforeShiftSolveDeadline.isOpen.value = true)
  },
  {
    key: 'remake',
    if: () => workIsSolved && workIsRemakeable && isStudent,
    size: 'medium',
    variant: 'tertiary',
    label: 'Переделать работу',
    handler: () => (modals.beforeRemake.isOpen.value = true)
  },
  {
    key: 'check-work',
    if: () => !workIsChecked && isMentor,
    size: 'large',
    variant: 'primary',
    label: 'Отправить проверку',
    handler: () => (modals.beforeMarkChecked.isOpen.value = true)
  },
  {
    key: 'save-state',
    if: () => !workIsChecked && isMentor,
    size: 'medium',
    variant: 'tertiary',
    label: 'Сохранить',
    handler: () => assignedWorkDetailStore.save()
  },
  {
    key: 'add-helper-mentor',
    if: () => !workIsChecked && workIsSolved && isMentor,
    size: 'medium',
    variant: 'tertiary',
    label: 'Добавить помогающего куратора',
    handler: () => (modals.beforeAddHelperMentor.isOpen.value = true)
  },
  {
    key: 'shift-check-deadline',
    if: () => !workIsChecked && isMentor,
    size: 'medium',
    variant: 'tertiary',
    label: 'Сдвинуть дедлайн проверки',
    handler: () => (modals.beforeShiftCheckDeadline.isOpen.value = true)
  },
  {
    key: 'mark-unsolved',
    if: () => isMentor,
    size: 'medium',
    variant: 'tertiary',
    label: 'Отправить на доработку',
    handler: () => (modals.beforeMarkUnsolved.isOpen.value = true)
  },
  {
    key: 'mark-unchecked',
    if: () => isMentor && workIsChecked,
    size: 'medium',
    variant: 'tertiary',
    label: 'Отменить проверку',
    handler: () => (modals.beforeMarkUnchecked.isOpen.value = true)
  },
  {
    key: 'show-history',
    if: () => true,
    size: 'medium',
    variant: 'tertiary',
    label: 'История изменений',
    handler: () => (modals.history.isOpen.value = true)
  }
] as const

const availableActions = computed<AssignedWorkAction[]>(() =>
  actions.filter((action) => action.if())
)

const modals = {
  beforeMarkSolved: { isOpen: shallowRef(false) },
  beforeMarkChecked: { isOpen: shallowRef(false) },
  beforeRemake: {
    isOpen: shallowRef(false),
    options: ref<AssignedWorkRemakeOptions>({
      includeOnlyWrongTasks: false
    })
  },
  beforeShiftSolveDeadline: { isOpen: shallowRef(false) },
  beforeShiftCheckDeadline: { isOpen: shallowRef(false) },
  beforeAddHelperMentor: {
    isOpen: shallowRef(false),
    options: ref<AddHelperMentorOptions>({
      mentorId: '',
      notifyMentor: true,
      notifyStudent: true
    })
  },
  beforeMarkUnsolved: { isOpen: shallowRef(false) },
  beforeMarkUnchecked: { isOpen: shallowRef(false) },
  history: { isOpen: shallowRef(false) }
} as const
</script>

<style scoped lang="sass">
.assigned-work-actions
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25em
  margin: 1em 0

  &__action
    &--medium
      width: 75%

    &--large
      width: 100%
      margin: 0.5em 0
</style>
