<template>
  <div class="own-courses-page">
    <noo-tabs-layout
      use-route-tabs
      with-padding
      route-param-name="tabId"
    >
      <template #tab-title-all>
        <span>Все курсы</span>
      </template>
      <template #tab-all>
        <all-courses-view />
      </template>
      <template
        v-if="can(CoursePermissions.viewOwnTab)"
        #tab-title-own
      >
        <span>Мои курсы</span>
      </template>
      <template
        v-if="can(CoursePermissions.viewOwnTab)"
        #tab-own
      >
        <own-courses-view />
      </template>
      <template
        v-if="can(CoursePermissions.viewArchivedTab)"
        #tab-title-archived
      >
        <span>Архив</span>
      </template>
      <template
        v-if="can(CoursePermissions.viewArchivedTab)"
        #tab-archived
      >
        <archived-courses-view />
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import type { CourseListTab } from '../types'
import { CoursePermissions, useCoursePermissions } from '../permissions'
import AllCoursesView from '../views/all-courses-view.vue'
import ArchivedCoursesView from '../views/archived-courses-view.vue'
import OwnCoursesView from '../views/own-courses-view.vue'

export interface CourseListPageProps {
  tabId: CourseListTab
}

defineProps<CourseListPageProps>()

const { can } = useCoursePermissions()
</script>
