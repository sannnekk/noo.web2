<template>
  <div class="works-detail-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <work-sidebar />
      </template>
      <template #content>
        <task-form />
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import taskForm from '../components/task-form.vue'
import workSidebar from '../components/work-sidebar.vue'
import { useWorkDetailStore } from '../stores/work-detail.store'

export interface WorksDetailPageProps {
  workId?: string
}

defineProps<WorksDetailPageProps>()

const workDetailStore = useWorkDetailStore()

onUnmounted(() => {
  workDetailStore.reset()
})
</script>
