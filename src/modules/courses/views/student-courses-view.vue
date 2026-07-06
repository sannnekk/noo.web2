<template>
  <div class="student-courses-view">
    <noo-card-search-view
      v-model:search="search.search.value"
      v-model:page="search.page.value"
      :items="memberships"
      :total-count="search.total.value"
      :is-loading="search.isLoading.value"
      :limit="25"
      :per-row="3"
      :error="search.error.value"
      :try-again="search.reload"
    >
      <template #tile="{ item }">
        <noo-course-card
          v-if="item.course"
          :course="item.course"
          :membership="item"
          @deleted="search.reload"
          @membership-updated="search.reload"
        />
      </template>
    </noo-card-search-view>
  </div>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { useAuthStore } from '@/core/stores/auth.store'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { computed } from 'vue'
import { CourseService } from '../api/course.service'
import type { CourseMembershipEntity } from '../api/course.types'

const props = defineProps<{ archived: boolean }>()

const authStore = useAuthStore()

const search = useSearch<CourseMembershipEntity>(CourseService.getMemberships, {
  immediate: true,
  initialFilters: [
    new EqualsFilter('isArchivedByStudent', props.archived),
    ...(authStore.userId
      ? [new EqualsFilter('studentId', authStore.userId)]
      : [])
  ]
})

const memberships = computed<CourseMembershipEntity[]>(() => {
  const byCourseId = new Map<string, CourseMembershipEntity>()

  for (const membership of search.data.value) {
    const course = membership.course

    if (!course || byCourseId.has(course.id)) {
      continue
    }

    byCourseId.set(course.id, membership)
  }

  return [...byCourseId.values()]
})
</script>
