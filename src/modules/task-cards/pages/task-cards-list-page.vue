<template>
  <div class="task-cards-list-page">
    <task-cards-list-view
      v-model:page="savedTaskSearch.page.value"
      v-model:search="savedTaskSearch.search.value"
      v-model:filters="savedTaskSearch.filters.value"
      :items="savedTaskSearch.data.value"
      :total-count="savedTaskSearch.total.value"
      :is-loading="savedTaskSearch.isLoading.value"
      :limit="savedTaskSearch.pageSize.value"
      :error="savedTaskSearch.error.value"
      :try-again="savedTaskSearch.reload"
    />
  </div>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { SavedTaskService } from '../api/saved-task.service'
import taskCardsListView from '../views/task-cards-list-view.vue'

const savedTaskSearch = useSearch(SavedTaskService.get)
</script>

<style scoped lang="sass">
.task-cards-list-page
  padding-block: var(--space-2xs)
</style>
