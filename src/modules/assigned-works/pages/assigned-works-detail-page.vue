<template>
  <div
    v-if="assignedWorkDetailStore.assignedWork?.work"
    class="assigned-works-detail-page"
  >
    <noo-sidebar-layout>
      <template #sidebar>
        <assigned-work-sidebar />
      </template>
      <template #content>
        <autosave-status v-if="mode !== 'read'" />
        <router-view />
      </template>
    </noo-sidebar-layout>
  </div>
  <div
    v-else
    class="assigned-works-detail-page__error"
  >
    <noo-error-block
      with-image
      centered
      :try-again="tryAgainFunc"
    >
      <noo-title :size="3">
        Ошибка загрузки работы
      </noo-title>
      <noo-text-block
        dimmed
        size="small"
      >
        Не удалось загрузить работу. Возможно, она была удалена или вы больше не
        имеете доступа к ней
      </noo-text-block>
    </noo-error-block>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import assignedWorkSidebar from '../components/assigned-work-sidebar.vue'
import AutosaveStatus from '../components/autosave-status.vue'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import type { AssignedWorkViewMode } from '../types'

export interface AssignedWorkDetailPageProps {
  assignedWorkId: string
  mode: AssignedWorkViewMode
}

const props = defineProps<AssignedWorkDetailPageProps>()

const assignedWorkDetailStore = useAssignedWorkDetailStore()

assignedWorkDetailStore.setMode(props.mode)

onUnmounted(() => {
  assignedWorkDetailStore.reset()
})

function tryAgainFunc() {
  assignedWorkDetailStore.init(props.assignedWorkId)
}
</script>
