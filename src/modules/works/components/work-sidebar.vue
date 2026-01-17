<template>
  <noo-sidebar-skeleton v-if="workDetailStore.mode === 'loading'" />
  <div
    v-else-if="workDetailStore.work"
    class="work-sidebar"
  >
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
  <noo-sure-modal
    v-model:is-open="sureChangeModeModalOpen"
    @confirm="onConfirmChangeModeToView()"
  >
    <template #title>
      <noo-title :size="3"> Вернуться в режим просмотра </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        У вас есть несохранённые изменения. Если вы вернётесь в режим просмотра,
        все несохранённые изменения будут потеряны.
      </noo-text-block>
    </template>
    <template #confirm-action-text> В режим просмотра </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import type { ViewMode } from '@/core/composables/useViewMode'
import { JsonPatchUtils } from '@/core/utils/jsonpatch.utils'
import { computed, shallowRef } from 'vue'
import { workConfig } from '../config'
import { workTypes } from '../constants'
import { useWorkDetailStore } from '../stores/work-detail.store'
import saveWorkChangesModal from './save-work-changes-modal.vue'
import taskGrid from './task-grid.vue'

const saveChangesModalOpen = shallowRef(false)
const sureChangeModeModalOpen = shallowRef(false)

const workDetailStore = useWorkDetailStore()

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
function changeMode(newMode: ViewMode): void {
  if (
    workDetailStore.mode !== 'view' &&
    newMode === 'view' &&
    workDetailStore.workPatchGenerator &&
    workDetailStore.workPatchGenerator.countChanges() > 0
  ) {
    sureChangeModeModalOpen.value = true

    return
  }

  workDetailStore.mode = newMode
}

function onConfirmChangeModeToView() {
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
