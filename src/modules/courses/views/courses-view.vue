<template>
  <div class="courses-view">
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
      <template #above-content>
        <noo-search-filters v-model:filters="search.filters.value">
          <noo-search-subject-filter
            v-model:filters="search.filters.value"
            filter-key="subjectId"
          />
          <noo-search-range-filter
            v-model:filters="search.filters.value"
            filter-key="createdAt"
            from-label="Дата создания с"
            to-label="до"
          />
        </noo-search-filters>
      </template>
      <template
        v-if="!archived"
        #actions
      >
        <noo-button
          v-if="can(CoursePermissions.createCourse)"
          :to="{ name: 'courses.edit' }"
        >
          Создать курс
        </noo-button>
      </template>
      <template #tile="{ item }">
        <noo-course-card
          :course="item"
          @deleted="search.reload"
          @archive-toggled="search.reload"
        />
      </template>
    </noo-card-search-view>
  </div>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { useAuthStore } from '@/core/stores/auth.store'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { CourseService } from '../api/course.service'
import { CoursePermissions, useCoursePermissions } from '../permissions'

interface Props {
  /**
   * Whether to show archived courses only. Non-archived courses
   * are shown otherwise.
   */
  archived?: boolean
  /**
   * Whether to show only the courses authored by the current user.
   */
  ownOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  archived: false,
  ownOnly: false
})

const authStore = useAuthStore()
const { can } = useCoursePermissions()

const search = useSearch(CourseService.get, {
  immediate: true,
  initialFilters: [
    new EqualsFilter('isArchived', props.archived),
    ...(props.ownOnly && authStore.userId
      ? [new EqualsFilter('authorId', authStore.userId)]
      : [])
  ]
})
</script>
