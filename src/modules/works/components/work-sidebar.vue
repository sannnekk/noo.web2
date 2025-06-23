<template>
  <div
    v-if="workDetailStore.work"
    class="work-sidebar"
  >
    <div class="work-sidebar__subject">
      <noo-subject-block :subject="workDetailStore.work.subject" />
    </div>
    <div class="work-sidebar__title">
      <noo-title :size="2">
        {{ workDetailStore.work.title }}
      </noo-title>
    </div>
    <div class="work-sidebar__description">
      <noo-if-animation>
        <noo-text-block
          v-if="workDetailStore.work.description"
          dimmed
          size="small"
        >
          {{ workDetailStore.work.description }}
        </noo-text-block>
      </noo-if-animation>
    </div>
    <div
      v-if="workDetailStore.work.tasks?.length"
      class="work-sidebar__task-grid"
    >
      <task-grid
        :tasks="workDetailStore.work.tasks"
        :active-task-key="workDetailStore.task?._key"
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
        @click="workDetailStore.save()"
      >
        Сохранить
      </noo-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { workConfig } from '../config'
import { useWorkDetailStore } from '../stores/work-detail.store'
import type { WorkViewMode } from '../types'
import taskGrid from './task-grid.vue'

const workDetailStore = useWorkDetailStore()

const canAddTask = computed(() => {
  return (
    typeof workDetailStore.work?.tasks?.length !== 'undefined' &&
    workDetailStore.work.tasks.length < workConfig.maxTaskPerWork &&
    (workDetailStore.mode === 'create' || workDetailStore.mode === 'edit')
  )
})

const canSaveWork = computed(() => {
  return (
    (workDetailStore.mode === 'create' || workDetailStore.mode === 'edit') &&
    workDetailStore.workValidationState.isValid
  )
})

function changeMode(mode: WorkViewMode) {
  workDetailStore.mode = mode
}
</script>

<style scoped lang="sass">
.work-sidebar
  &__actions
    display: flex
    flex-direction: column
    align-items: center
    gap: 10px

  &__task-grid
    margin: 1em 0
</style>
