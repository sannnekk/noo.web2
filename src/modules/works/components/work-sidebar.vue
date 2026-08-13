<template>
  <noo-sidebar-skeleton v-if="workDetailStore.mode === 'loading'" />
  <div
    v-else-if="workDetailStore.work"
    class="work-sidebar"
  >
    <div class="work-sidebar__back-button">
      <noo-back-button
        :route="{
          name: 'works.list'
        }"
      >
        Назад к списку работ
      </noo-back-button>
    </div>
    <div class="work-sidebar__subject">
      <noo-subject-block
        v-if="workDetailStore.mode === 'view'"
        :subject="workDetailStore.work.subject ?? null"
      />
      <noo-subject-select
        v-else
        v-model:subject="workDetailStore.work.subject"
        v-model:subject-id="workDetailStore.work.subjectId"
        label="Предмет"
        :errors="workDetailStore.workValidationState.fieldErrors.subjectId"
      />
    </div>
    <div class="work-sidebar__title">
      <noo-title
        v-if="workDetailStore.mode === 'view'"
        :size="2"
      >
        {{ workDetailStore.work.title }}
      </noo-title>
      <noo-text-input
        v-else
        v-model="workDetailStore.work.title"
        label="Название работы"
        :errors="workDetailStore.workValidationState.fieldErrors.title"
      />
    </div>
    <div class="work-sidebar__type">
      <noo-title
        v-if="workDetailStore.mode === 'view'"
        :size="5"
      >
        Тип работы:
        {{
          workTypes.find((type) => type.value === workDetailStore.work?.type)
            ?.label || 'Не указан'
        }}
      </noo-title>
      <noo-work-type-select
        v-else
        v-model="workDetailStore.work.type"
        label="Тип работы"
        :errors="workDetailStore.workValidationState.fieldErrors.type"
      />
    </div>
    <div class="work-sidebar__description">
      <noo-text-block
        v-if="workDetailStore.mode === 'view'"
        dimmed
        size="small"
      >
        {{ workDetailStore.work.description ?? 'Описание отсутствует' }}
      </noo-text-block>
      <noo-textarea
        v-else
        v-model="workDetailStore.work.description"
        label="Описание работы"
        :errors="workDetailStore.workValidationState.fieldErrors.description"
      />
    </div>
    <div
      v-if="workDetailStore.work.tasks?.length"
      class="work-sidebar__task-grid"
    >
      <task-grid
        :tasks="workDetailStore.work.tasks"
        :active-task-key="workDetailStore.task?._key"
        :show-new-label="workDetailStore.mode !== 'create'"
        @task-clicked="workDetailStore.task = $event"
      />
    </div>
    <div class="work-sidebar__actions">
      <noo-button
        v-if="canAddTask"
        variant="secondary"
        @click="workDetailStore.addTask()"
      >
        Добавить задание
      </noo-button>
      <noo-button
        v-if="workDetailStore.mode === 'view'"
        variant="secondary"
        @click="changeMode('edit')"
      >
        Редактировать
      </noo-button>
      <noo-button
        v-if="workDetailStore.mode === 'edit'"
        variant="secondary"
        @click="changeMode('view')"
      >
        В режим просмотра
      </noo-button>
      <noo-button
        v-if="canSaveWork"
        variant="primary"
        size="large"
        @click="saveChangesModalOpen = true"
      >
        Сохранить
      </noo-button>
    </div>
  </div>
  <save-work-changes-modal v-model:is-open="saveChangesModalOpen" />
  <noo-unsaved-changes-modal
    v-model:is-open="isAsking"
    :can-save="canSave"
    :changes-count="changesCount"
    @decide="decide"
  >
    <template #changes>
      <work-patch-list
        :patch="workDetailStore.workPatchGenerator!.generate()"
        :original="workDetailStore.workPatchGenerator!.getOriginal()"
      />
    </template>
  </noo-unsaved-changes-modal>
</template>

<script setup lang="ts">
import { useUnsavedChangesGuard } from '@/core/composables/useUnsavedChangesGuard'
import type { ViewMode } from '@/core/composables/useViewMode'
import { JsonPatchUtils } from '@/core/utils/jsonpatch.utils'
import { computed, shallowRef } from 'vue'
import { workConfig } from '../config'
import { workTypes } from '../constants'
import { useWorkDetailStore } from '../stores/work-detail.store'
import saveWorkChangesModal from './save-work-changes-modal.vue'
import taskGrid from './task-grid.vue'
import workPatchList from './work-patch-list.vue'

const saveChangesModalOpen = shallowRef(false)

const workDetailStore = useWorkDetailStore()

const changesCount = computed(
  () => workDetailStore.workPatchGenerator?.countChanges() ?? 0
)

const { isAsking, canSave, decide, confirm } = useUnsavedChangesGuard({
  hasChanges: () => workDetailStore.hasChanges(),
  // A work that was never created is saved by being navigated to, which is no
  // way to leave the page it is being left from.
  canSave: () =>
    workDetailStore.mode === 'edit' &&
    workDetailStore.workValidationState.isValid === true,
  save: () => workDetailStore.save()
})

const canAddTask = computed(() => {
  return (
    typeof workDetailStore.work?.tasks !== 'undefined' &&
    workDetailStore.work.tasks.length < workConfig.maxTaskPerWork &&
    (workDetailStore.mode === 'create' || workDetailStore.mode === 'edit')
  )
})

const canSaveWork = computed(() => {
  return workDetailStore.mode === 'create' || workDetailStore.mode === 'edit'
})

/**
 * Change the current mode of the work view.
 */
async function changeMode(newMode: ViewMode): Promise<void> {
  if (workDetailStore.mode !== 'view' && newMode === 'view') {
    if (!(await confirm())) {
      return
    }

    revertToOriginalWork()

    return
  }

  workDetailStore.mode = newMode
}

function revertToOriginalWork() {
  const currentTaskId = workDetailStore.task?.id

  workDetailStore.task = null
  workDetailStore.work = workDetailStore.workPatchGenerator!.getOriginal()
  workDetailStore.workPatchGenerator = JsonPatchUtils.observe(
    workDetailStore.work
  )
  workDetailStore.mode = 'view'

  if (currentTaskId) {
    const originalTask = workDetailStore.work!.tasks?.find(
      (task) => task.id === currentTaskId
    )

    if (originalTask) {
      workDetailStore.task = originalTask
    }
  }
}
</script>

<style scoped lang="sass">
.work-sidebar
  &__actions
    display: flex
    flex-direction: column
    align-items: center
    gap: 10px
    margin-top: 2em

  &__task-grid
    margin: 1em 0
</style>
