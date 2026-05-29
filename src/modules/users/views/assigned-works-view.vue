<template>
  <div class="assigned-works-view">
    <assigned-works-list-view
      v-model:search="search.search.value"
      v-model:page="search.page.value"
      :works="search.data.value"
      :total-count="search.total.value"
      :is-loading="search.isLoading.value"
      :error="search.error.value"
      :try-again="search.reload"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { AssignedWorkService } from '@/modules/assigned-works/api/assigned-work.service'
import type { AssignedWorkEntity } from '@/modules/assigned-works/api/assigned-work.types'
import assignedWorksListView from '@/modules/assigned-works/views/assigned-works-list-view.vue'
import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()

const search = useSearch<AssignedWorkEntity>(
  (pagination) => AssignedWorkService.get(pagination),
  { immediate: false }
)

watch(
  () => userDetailStore.user.data,
  (user) => {
    if (user?.role === 'student') {
      search.filters.value = [new EqualsFilter('StudentId', user.id)]
    } else if (user?.role === 'mentor') {
      search.filters.value = [new EqualsFilter('MentorId', user.id)]
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="sass">
.assigned-works-view
  padding-top: 0.5em
</style>
