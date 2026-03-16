<template>
  <div class="own-courses-view">
    <noo-card-search-view
      v-model:search="search.search.value"
      v-model:page="search.page.value"
      :items="courses"
      :total-count="search.total.value"
      :is-loading="search.isLoading.value"
      :limit="25"
      :per-row="3"
    >
      <template #actions>
        <noo-button
          v-if="can(CoursePermissions.createCourse)"
          :to="{ name: 'courses.edit' }"
        >
          Создать курс
        </noo-button>
      </template>
      <template #tile="{ item }">
        <noo-course-card :course="item" />
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
import { CoursePermissions, useCoursePermissions } from '../permissions'

const authStore = useAuthStore()
const { can } = useCoursePermissions()

const ownerFilterKey = can(CoursePermissions.useStudentOwnershipFilter)
  ? 'studentId'
  : 'assignerId'

const initialFilters = [
  new EqualsFilter('isArchived', false),
  ...(authStore.userInfo?.id
    ? [new EqualsFilter(ownerFilterKey, authStore.userInfo.id)]
    : [])
]

const search = useSearch<CourseMembershipEntity>(CourseService.getMemberships, {
  immediate: true,
  initialFilters
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
