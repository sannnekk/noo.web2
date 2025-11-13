<template>
  <div class="works-detail-page">
    <noo-sidebar-layout v-if="workDetailStore.mode !== 'error'">
      <template #sidebar>
        <work-sidebar />
      </template>
      <template #content>
        <task-form />
      </template>
    </noo-sidebar-layout>
    <noo-error-block
      v-else
      with-image
      centered
      :try-again="() => workDetailStore.init(workId)"
    >
      <noo-title :size="3"> Ошибка при загрузке работы </noo-title>
      <template #actions>
        <noo-button
          variant="primary"
          @click="router.back()"
        >
          Вернуться к списку работ
        </noo-button>
      </template>
    </noo-error-block>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import taskForm from '../components/task-form.vue'
import workSidebar from '../components/work-sidebar.vue'
import { useWorkDetailStore } from '../stores/work-detail.store'

export interface WorksDetailPageProps {
  workId?: string
}

defineProps<WorksDetailPageProps>()

const workDetailStore = useWorkDetailStore()
const router = useRouter()

onUnmounted(() => {
  workDetailStore.reset()
})
</script>
