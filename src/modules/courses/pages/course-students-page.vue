<template>
  <div class="course-students-page">
    course students page, courseId: {{ courseId }}
  </div>
</template>

<script setup lang="ts">
export interface CourseStudentsPageProps {
  courseId: string
}

defineProps<CourseStudentsPageProps>()
</script>

<style scoped lang="sass"></style>
