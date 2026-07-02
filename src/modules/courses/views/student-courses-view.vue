<template>
  <div class="student-courses-view">
    <noo-card-search-view
      v-model:search="search.search.value"
      v-model:page="search.page.value"
      :items="courses"
      :total-count="search.total.value"
      :is-loading="search.isLoading.value"
      :limit="25"
      :per-row="3"
      :error="search.error.value"
      :try-again="search.reload"
    >
      <template #tile="{ item }">
        <noo-course-card
          :course="item"
          @deleted="search.reload"
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
import type { CourseEntity, CourseMembershipEntity } from '../api/course.types'

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

const courses = computed<CourseEntity[]>(() => {
  const byId = new Map<string, CourseEntity>()

  for (const membership of search.data.value) {
    const course = membership.course

    if (!course || byId.has(course.id)) {
      continue
    }

    byId.set(course.id, course)
  }

  return [...byId.values()]
})
</script>
