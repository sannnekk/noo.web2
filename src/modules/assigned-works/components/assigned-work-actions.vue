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
      :is-loading="action.isLoading?.()"
      :disabled="isBusy"
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
    :can-confirm="!!modals.beforeAddHelperMentor.options.value.mentorId"
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
      <noo-text-block dimmed>
        Выберите куратора, который будет помогать в проверке работы.
      </noo-text-block>
      <noo-user-select
        v-model:ids="helperMentorId"
        role="mentor"
        label="Помогающий куратор"
        placeholder="Начните вводить имя, email или никнейм куратора"
      />
      <noo-checkbox
        v-model="modals.beforeAddHelperMentor.options.value.notifyMentor"
      >
        <noo-text-block dimmed> Уведомить куратора </noo-text-block>
      </noo-checkbox>
      <noo-checkbox
        v-model="modals.beforeAddHelperMentor.options.value.notifyStudent"
      >
        <noo-text-block dimmed> Уведомить ученика </noo-text-block>
      </noo-checkbox>
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
import { useHotkeys } from '@/core/composables/useHotkeys'
import { computed, ref, shallowRef, watch } from 'vue'
import type { AddHelperMentorOptions } from '../api/assigned-work.types'
import { type AssignedWorkRemakeOptions } from '../api/assigned-work.types'
import { AssignedWorkConfig } from '../config'
import {
  AssignedWorksPermissions,
  useAssignedWorksPermissions
} from '../permissions'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import historyModal from './history-modal.vue'

interface AssignedWorkAction {
  key: string
  if: () => boolean
  size: ButtonSize
  variant: ButtonType
  label: string
  /** The shortcut that reaches it, where it is worth reaching by key. */
  hotkey?: string
  /** Whether its own request is in flight, for the ones that make one. */
  isLoading?: () => boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: () => any
}

const { can } = useAssignedWorksPermissions()
const assignedWorkDetailStore = useAssignedWorkDetailStore()

// Read through the store rather than destructured out of it: a setup store
// unwraps its computeds, so `const { workIsChecked } = store` would hand back
// the boolean as it stands right now and never move again.
const workIsSolved = computed(() => assignedWorkDetailStore.workIsSolved)
const workIsChecked = computed(() => assignedWorkDetailStore.workIsChecked)
const workIsRemakeable = computed(
  () => assignedWorkDetailStore.workIsRemakeable
)
const isStudent = can(AssignedWorksPermissions.useStudentMode)
const isMentor = can(AssignedWorksPermissions.useMentorMode)
const canAddHelperMentor = can(AssignedWorksPermissions.addHelperMentor)
const mode = computed(() => assignedWorkDetailStore.viewMode)
const hasSolveDeadline = computed(
  () => !!assignedWorkDetailStore.assignedWork?.solveDeadlineAt
)
const hasCheckDeadline = computed(
  () => !!assignedWorkDetailStore.assignedWork?.checkDeadlineAt
)

const actions: AssignedWorkAction[] = [
  {
    key: 'to-solve-mode',
    if: () => !workIsSolved.value && isStudent && mode.value == 'read',
    size: 'medium',
    variant: 'primary',
    label: 'Перейти к выполнению',
    handler: () => assignedWorkDetailStore.setMode('solve')
  },
  {
    key: 'to-check-mode',
    if: () =>
      workIsSolved.value &&
      !workIsChecked.value &&
      isMentor &&
      mode.value == 'read',
    size: 'medium',
    variant: 'primary',
    label: 'Перейти к проверке',
    handler: () => assignedWorkDetailStore.setMode('check')
  },
  {
    key: 'submit-work',
    if: () => !workIsSolved.value && isStudent && mode.value == 'solve',
    size: 'large',
    variant: 'primary',
    label: 'Сдать работу',
    isLoading: () => assignedWorkDetailStore.markSolved.isLoading,
    handler: () => (modals.beforeMarkSolved.isOpen.value = true)
  },
  {
    key: 'save-solve-state',
    if: () => !workIsSolved.value && isStudent && mode.value == 'solve',
    size: 'medium',
    variant: 'tertiary',
    label: 'Сохранить без сдачи',
    hotkey: 'mod+s',
    handler: () => assignedWorkDetailStore.save()
  },
  {
    key: 'shift-solve-deadline',
    if: () =>
      !workIsSolved.value &&
      isStudent &&
      mode.value == 'solve' &&
      hasSolveDeadline.value,
    size: 'medium',
    variant: 'tertiary',
    label: 'Сдвинуть дедлайн',
    isLoading: () => assignedWorkDetailStore.shiftSolveDeadline.isLoading,
    handler: () => (modals.beforeShiftSolveDeadline.isOpen.value = true)
  },
  {
    key: 'remake',
    if: () =>
      workIsSolved.value &&
      workIsRemakeable.value &&
      isStudent &&
      mode.value == 'read',
    size: 'medium',
    variant: 'tertiary',
    label: 'Переделать работу',
    isLoading: () => assignedWorkDetailStore.remake.isLoading,
    handler: () => (modals.beforeRemake.isOpen.value = true)
  },
  {
    // A work that was never handed in has nothing to check, and the server
    // refuses it outright.
    key: 'check-work',
    if: () =>
      workIsSolved.value &&
      !workIsChecked.value &&
      isMentor &&
      mode.value == 'check',
    size: 'large',
    variant: 'primary',
    label: 'Отправить проверку',
    isLoading: () => assignedWorkDetailStore.markChecked.isLoading,
    handler: () => (modals.beforeMarkChecked.isOpen.value = true)
  },
  {
    key: 'save-check-state',
    if: () => !workIsChecked.value && isMentor && mode.value == 'check',
    size: 'medium',
    variant: 'tertiary',
    label: 'Сохранить',
    hotkey: 'mod+s',
    handler: () => assignedWorkDetailStore.save()
  },
  {
    key: 'add-helper-mentor',
    if: () =>
      !workIsChecked.value &&
      workIsSolved.value &&
      canAddHelperMentor &&
      mode.value == 'check',
    size: 'medium',
    variant: 'tertiary',
    label: 'Добавить помогающего куратора',
    isLoading: () => assignedWorkDetailStore.addHelperMentor.isLoading,
    handler: () => (modals.beforeAddHelperMentor.isOpen.value = true)
  },
  {
    key: 'shift-check-deadline',
    if: () =>
      !workIsChecked.value &&
      isMentor &&
      mode.value == 'check' &&
      hasCheckDeadline.value,
    size: 'medium',
    variant: 'tertiary',
    label: 'Сдвинуть дедлайн проверки',
    isLoading: () => assignedWorkDetailStore.shiftCheckDeadline.isLoading,
    handler: () => (modals.beforeShiftCheckDeadline.isOpen.value = true)
  },
  {
    key: 'to-read-mode',
    if: () =>
      (isStudent && mode.value == 'solve') ||
      (isMentor && mode.value == 'check'),
    size: 'medium',
    variant: 'tertiary',
    label: 'В режим просмотра',
    // Read mode is the one mode that never writes, so what is still pending has
    // to reach the server before the user leaves the mode that was saving it.
    handler: async () => {
      if (await assignedWorkDetailStore.save()) {
        assignedWorkDetailStore.setMode('read')
      }
    }
  },
  {
    key: 'mark-unsolved',
    if: () => isMentor && !workIsChecked.value && workIsSolved.value,
    size: 'medium',
    variant: 'tertiary',
    label: 'Отправить на доработку',
    isLoading: () => assignedWorkDetailStore.markUnsolved.isLoading,
    handler: () => (modals.beforeMarkUnsolved.isOpen.value = true)
  },
  {
    key: 'mark-unchecked',
    if: () => isMentor && workIsChecked.value,
    size: 'medium',
    variant: 'tertiary',
    label: 'Отменить проверку',
    isLoading: () => assignedWorkDetailStore.markUnchecked.isLoading,
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

// The shortcuts are the action list read back: an action carrying a `hotkey`
// answers to it under exactly the conditions that put its button on screen.
useHotkeys(() =>
  actions
    .filter((action) => !!action.hotkey)
    .map((action) => ({
      combo: action.hotkey!,
      description: action.label,
      when: action.if,
      // These are the work's own commands rather than editing ones, so they stay
      // within reach while an answer is being written.
      allowInEditable: true,
      handler: action.handler
    }))
)

const availableActions = computed<AssignedWorkAction[]>(() =>
  actions.filter((action) => action.if())
)

// One request at a time: these change the work out from under each other, and
// the work is re-read once any of them lands.
const isBusy = computed(() =>
  actions.some((action) => action.isLoading?.() === true)
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

// The picker speaks in ids that may be a list; a work takes exactly one helper.
const helperMentorId = computed<string | string[] | null>({
  get: () => modals.beforeAddHelperMentor.options.value.mentorId || null,
  set: (value) => {
    modals.beforeAddHelperMentor.options.value.mentorId =
      typeof value === 'string' ? value : ''
  }
})

// Nobody should be handed the mentor they picked and abandoned last time.
watch(modals.beforeAddHelperMentor.isOpen, (opened) => {
  if (opened) {
    modals.beforeAddHelperMentor.options.value = {
      mentorId: '',
      notifyMentor: true,
      notifyStudent: true
    }
  }
})
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
