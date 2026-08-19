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
      <template
        v-for="tab in assignedWorkListTabs"
        :key="tab"
        #[`tab-title-${tab}`]
      >
        <span class="assigned-works-list-page__tab-title">
          {{ tabTitles[tab] }}
          <noo-tab-counter
            :count="assignedWorksListStore.counts[tab]"
            :is-loading="assignedWorksListStore.metadata.isLoading"
          />
        </span>
      </template>

      <template
        v-for="tab in assignedWorkListTabs"
        :key="tab"
        #[`tab-${tab}`]
      >
        <assigned-works-list-view
          v-model:search="assignedWorksListStore.searches[tab].search"
          v-model:page="assignedWorksListStore.searches[tab].page"
          v-model:filters="assignedWorksListStore.searches[tab].filters"
          :works="assignedWorksListStore.searches[tab].data"
          :total-count="assignedWorksListStore.searches[tab].total"
          :is-loading="assignedWorksListStore.searches[tab].isLoading"
          :error="assignedWorksListStore.searches[tab].error"
          :try-again="assignedWorksListStore.searches[tab].reload"
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
import { assignedWorkListTabs, type AssignedWorkListTab } from '../types'

const assignedWorksListStore = useAssignedWorkListStore()

const tabTitles: Record<AssignedWorkListTab, string> = {
  all: 'Все работы',
  'not-made': 'Нерешенные',
  'not-checked': 'Непроверенные',
  checked: 'Проверенные'
}

onMounted(async () => {
  await assignedWorksListStore.metadata.execute()
})
</script>
