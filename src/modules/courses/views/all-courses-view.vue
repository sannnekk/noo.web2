<template>
  <noo-card-search-view
    v-model:search="search.search.value"
    v-model:page="search.page.value"
    :items="search.data.value"
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
      <noo-button
        v-if="can(CoursePermissions.viewCourseShop)"
        :to="AppConstants.courseShopLink"
      >
        Наш магазин курсов
      </noo-button>
    </template>
    <template #tile="{ item }">
      <noo-course-card :course="item" />
    </template>
  </noo-card-search-view>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { AppConstants } from '@/core/config/constants.config'
import { CourseService } from '../api/course.service'
import { CoursePermissions, useCoursePermissions } from '../permissions'

const search = useSearch(CourseService.get, { immediate: true })
const { can } = useCoursePermissions()
</script>
