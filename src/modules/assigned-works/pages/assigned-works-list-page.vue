<template>
  <div class="assigned-works-list-page">
    <noo-tabs-layout
      use-route-tabs
      with-padding
      route-param-name="tab"
    >
      <template #tab-title-all>
        <span class="assigned-works-list-page__tab-title">
          Все работы ({{ assignedWorksListStore.allSearch.total }})
        </span>
      </template>
      <template #tab-all>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.allSearch.search"
          v-model:page="assignedWorksListStore.allSearch.page"
          :works="/* assignedWorksListStore.allSearch.data */ assignedWorkList"
          :total-count="assignedWorksListStore.allSearch.total"
          :is-loading="assignedWorksListStore.allSearch.isLoading"
        />
      </template>
      <template #tab-title-not-made>
        <span class="assigned-works-list-page__tab-title">
          Нерешенные ({{ assignedWorksListStore.notMadeSearch.total }})
        </span>
      </template>
      <template #tab-not-made>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.notMadeSearch.search"
          v-model:page="assignedWorksListStore.notMadeSearch.page"
          :works="assignedWorksListStore.notMadeSearch.data"
          :total-count="assignedWorksListStore.notMadeSearch.total"
          :is-loading="assignedWorksListStore.notMadeSearch.isLoading"
        />
      </template>
      <template #tab-title-not-checked>
        <span class="assigned-works-list-page__tab-title">
          Непроверенные ({{ assignedWorksListStore.notCheckedSearch.total }})
        </span>
      </template>
      <template #tab-not-checked>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.notCheckedSearch.search"
          v-model:page="assignedWorksListStore.notCheckedSearch.page"
          :works="assignedWorksListStore.notCheckedSearch.data"
          :total-count="assignedWorksListStore.notCheckedSearch.total"
          :is-loading="assignedWorksListStore.notCheckedSearch.isLoading"
        />
      </template>
      <template #tab-title-checked>
        <span class="assigned-works-list-page__tab-title">
          Проверенные ({{ assignedWorksListStore.checkedSearch.total }})
        </span>
      </template>
      <template #tab-checked>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.checkedSearch.search"
          v-model:page="assignedWorksListStore.checkedSearch.page"
          :works="assignedWorksListStore.checkedSearch.data"
          :total-count="assignedWorksListStore.checkedSearch.total"
          :is-loading="assignedWorksListStore.checkedSearch.isLoading"
        />
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import assignedWorksListView from '../views/assigned-works-list-view.vue'
import { watch } from 'vue'
import { useAssignedWorkListStore } from '../stores/assigned-work-list.store'
import type { AssignedWorkListTab } from '../types'
import { assignedWorkList } from '../mock-data/assigned-works'

export interface AssignedWorkListPageProps {
  tabId?: AssignedWorkListTab
  userId?: string
}

const props = defineProps<AssignedWorkListPageProps>()
const assignedWorksListStore = useAssignedWorkListStore()

watch(
  () => props.userId,
  () => {
    assignedWorksListStore.setUserId(props.userId)
  },
  { immediate: true }
)
</script>

<style scoped lang="sass"></style>
