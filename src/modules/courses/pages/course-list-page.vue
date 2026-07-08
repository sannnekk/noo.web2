<template>
  <div class="course-list-page">
    <noo-tabs-layout
      use-route-tabs
      with-padding
      route-param-name="tabId"
    >
      <template
        v-for="tab in visibleTabs"
        :key="tab.id"
        #[`tab-title-${tab.id}`]
      >
        <span>{{ tab.title }}</span>
      </template>
      <template
        v-for="tab in visibleTabs"
        :key="tab.id"
        #[`tab-${tab.id}`]
      >
        <component
          :is="tab.component"
          v-bind="tab.props"
        />
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { courseListTabs } from '../course-list-tabs'
import { useCoursePermissions } from '../permissions'
import type { CourseListTab } from '../types'

export interface CourseListPageProps {
  tabId: CourseListTab
}

defineProps<CourseListPageProps>()

const { can } = useCoursePermissions()

const visibleTabs = computed(() =>
  courseListTabs.filter((tab) => can(tab.permission))
)
</script>
