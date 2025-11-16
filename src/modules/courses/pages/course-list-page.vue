<template>
  <div class="own-courses-page">
    <noo-tabs-layout
      use-route-tabs
      route-param-name="tab"
    >
      <template #tab-title-all>
        <span>Все курсы</span>
      </template>
      <template #tab-all>
        <course-list-view
          :courses="courseListStore.allSearch.data"
          :total-count="courseListStore.allSearch.total"
        />
      </template>
      <template #tab-title-own>
        <span>Мои курсы</span>
      </template>
      <template #tab-own>
        For a teacher: course list view <br />
        For a student: course asssignemnt list view <br />
        For others: hidden
      </template>
      <template #tab-title-archived>
        <span>Архив</span>
      </template>
      <template #tab-archived>
        For a teacher: course list view <br />
        For a student: course asssignemnt list view <br />
        For others: hidden
      </template>
    </noo-tabs-layout>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useCourseListStore } from '../stores/course-list.store'
import type { CourseListTab } from '../types'
import courseListView from '../views/course-list-view.vue'

export interface CourseListPageProps {
  tabId: CourseListTab
}

const props = defineProps<CourseListPageProps>()

const courseListStore = useCourseListStore()

watch(
  () => props.tabId,
  (newTabId) => {
    switch (newTabId) {
      case 'all':
        courseListStore.allSearch.reload()
        break
      case 'own':
        // TODO: other searches
        //courseListStore..reload()
        break
      case 'archived':
        // TODO: other searches
        //courseListStore.archivedSearch.reload()
        break
      default:
        break
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="sass"></style>
