<template>
  <div class="assigned-works-list-page">
    <noo-tabs-layout
      use-route-tabs
      with-padding
      route-param-name="tab"
      @tab-change="
        assignedWorksListStore.onTabChange($event as AssignedWorkListTab)
      "
    >
      <template #tab-title-all>
        <span class="assigned-works-list-page__tab-title">
          Все работы
          <noo-tab-counter
            :count="assignedWorksListStore.counts.all"
            :is-loading="assignedWorksListStore.metadata.isLoading"
          />
        </span>
      </template>
      <template #tab-all>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.allSearch.search"
          v-model:page="assignedWorksListStore.allSearch.page"
          v-model:filters="assignedWorksListStore.allSearch.filters"
          :works="assignedWorksListStore.allSearch.data"
          :total-count="assignedWorksListStore.allSearch.total"
          :is-loading="assignedWorksListStore.allSearch.isLoading"
          :error="assignedWorksListStore.allSearch.error"
          :try-again="assignedWorksListStore.allSearch.reload"
          @archive="assignedWorksListStore.archive"
        />
      </template>
      <template #tab-title-not-made>
        <span class="assigned-works-list-page__tab-title">
          Нерешенные
          <noo-tab-counter
            :count="assignedWorksListStore.counts['not-made']"
            :is-loading="assignedWorksListStore.metadata.isLoading"
          />
        </span>
      </template>
      <template #tab-not-made>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.notMadeSearch.search"
          v-model:page="assignedWorksListStore.notMadeSearch.page"
          v-model:filters="assignedWorksListStore.notMadeSearch.filters"
          :works="assignedWorksListStore.notMadeSearch.data"
          :total-count="assignedWorksListStore.notMadeSearch.total"
          :is-loading="assignedWorksListStore.notMadeSearch.isLoading"
          :error="assignedWorksListStore.notMadeSearch.error"
          :try-again="assignedWorksListStore.notMadeSearch.reload"
          @archive="assignedWorksListStore.archive"
        />
      </template>
      <template #tab-title-not-checked>
        <span class="assigned-works-list-page__tab-title">
          Непроверенные
          <noo-tab-counter
            :count="assignedWorksListStore.counts['not-checked']"
            :is-loading="assignedWorksListStore.metadata.isLoading"
          />
        </span>
      </template>
      <template #tab-not-checked>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.notCheckedSearch.search"
          v-model:page="assignedWorksListStore.notCheckedSearch.page"
          v-model:filters="assignedWorksListStore.notCheckedSearch.filters"
          :works="assignedWorksListStore.notCheckedSearch.data"
          :total-count="assignedWorksListStore.notCheckedSearch.total"
          :is-loading="assignedWorksListStore.notCheckedSearch.isLoading"
          :error="assignedWorksListStore.notCheckedSearch.error"
          :try-again="assignedWorksListStore.notCheckedSearch.reload"
          @archive="assignedWorksListStore.archive"
        />
      </template>
      <template #tab-title-checked>
        <span class="assigned-works-list-page__tab-title">
          Проверенные
          <noo-tab-counter
            :count="assignedWorksListStore.counts.checked"
            :is-loading="assignedWorksListStore.metadata.isLoading"
          />
        </span>
      </template>
      <template #tab-checked>
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.checkedSearch.search"
          v-model:page="assignedWorksListStore.checkedSearch.page"
          v-model:filters="assignedWorksListStore.checkedSearch.filters"
          :works="assignedWorksListStore.checkedSearch.data"
          :total-count="assignedWorksListStore.checkedSearch.total"
          :is-loading="assignedWorksListStore.checkedSearch.isLoading"
          :error="assignedWorksListStore.checkedSearch.error"
          :try-again="assignedWorksListStore.checkedSearch.reload"
          @archive="assignedWorksListStore.archive"
        />
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import assignedWorksListView from '../views/assigned-works-list-view.vue'
import { onMounted } from 'vue'
import { useAssignedWorkListStore } from '../stores/assigned-work-list.store'
import type { AssignedWorkListTab } from '../types'

export interface AssignedWorkListPageProps {
  tabId?: AssignedWorkListTab
}

defineProps<AssignedWorkListPageProps>()
const assignedWorksListStore = useAssignedWorkListStore()

onMounted(async () => {
  await assignedWorksListStore.metadata.execute()
})
</script>
