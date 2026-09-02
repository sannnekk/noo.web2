<template>
  <div class="student-courses-view">
    <noo-card-search-view
      v-model:search="search.search.value"
      v-model:page="search.page.value"
      :items="search.data.value"
      :total-count="search.total.value"
      :is-loading="search.isLoading.value"
      :limit="25"
      :per-row="3"
      :error="search.error.value"
      :try-again="search.reload"
    >
      <template
        v-if="!archived"
        #actions
      >
        <noo-button
          v-if="settings && can(CoursePermissions.viewCourseShop)"
          :to="settings.shopLink"
          new-tab
        >
          Наш магазин курсов
        </noo-button>
      </template>
      <template #tile="{ item }">
        <noo-course-card
          :course="item.course"
          :student-course="item"
          @deleted="search.reload"
          @state-updated="search.reload"
        />
      </template>
    </noo-card-search-view>
  </div>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { usePlatformSettings } from '@/core/stores/platform-settings.store'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { CourseService } from '../api/course.service'
import type { StudentCourseEntity } from '../api/course.types'
import { CoursePermissions, useCoursePermissions } from '../permissions'

interface Props {
  /**
   * Whether to show only the courses archived by the current student.
   * Non-archived ones are shown otherwise.
   */
  archived?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  archived: false
})

const { can } = useCoursePermissions()

// Driven by courses rather than by membership rows, so a publicly open course the student
// was never assigned to appears here like any other. One row per course by construction —
// no client-side dedupe, and the total is the server's.
const search = useSearch<StudentCourseEntity>(CourseService.getMyCourses, {
  immediate: true,
  initialFilters: [new EqualsFilter('isArchived', props.archived)]
})

const settings = usePlatformSettings()
</script>
