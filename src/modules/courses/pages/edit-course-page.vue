<template>
  <div class="edit-course-page">
    <noo-sidebar-layout wide-sidebar>
      <template #sidebar>
        <course-edit-sidebar />
      </template>
      <template #content>
        <material-edit-form />
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import courseEditSidebar from '../components/course-edit-sidebar.vue'

export interface EditCoursePageProps {
  courseId?: string
}

defineProps<EditCoursePageProps>()
</script>

<style scoped lang="sass"></style>
