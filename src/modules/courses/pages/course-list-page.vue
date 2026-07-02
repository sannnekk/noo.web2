<template>
  <div class="own-courses-page">
    <noo-tabs-layout
      use-route-tabs
      with-padding
      route-param-name="tabId"
    >
      <template
        v-if="can(CoursePermissions.viewAllTab)"
        #tab-title-all
      >
        <span>Все курсы</span>
      </template>
      <template
        v-if="can(CoursePermissions.viewAllTab)"
        #tab-all
      >
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
        <student-courses-view
          v-if="isStudent"
          :archived="false"
        />
        <teacher-courses-view
          v-else
          :archived="false"
        />
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
        <student-courses-view
          v-if="isStudent"
          :archived="true"
        />
        <teacher-courses-view
          v-else
          :archived="true"
        />
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import type { CourseListTab } from '../types'
import { CoursePermissions, useCoursePermissions } from '../permissions'
import AllCoursesView from '../views/all-courses-view.vue'
import StudentCoursesView from '../views/student-courses-view.vue'
import TeacherCoursesView from '../views/teacher-courses-view.vue'

export interface CourseListPageProps {
  tabId: CourseListTab
}

defineProps<CourseListPageProps>()

const { can } = useCoursePermissions()

const isStudent = can(CoursePermissions.useStudentOwnershipFilter)
</script>
