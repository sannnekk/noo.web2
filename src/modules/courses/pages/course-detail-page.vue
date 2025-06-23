<template>
  <div class="course-detail-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <course-sidebar />
      </template>
      <template #content>
        <router-view />
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import CourseSidebar from '../components/course-sidebar.vue';

export interface CourseDetailPageProps {
  courseId?: string;
}

defineProps<CourseDetailPageProps>();
</script>
