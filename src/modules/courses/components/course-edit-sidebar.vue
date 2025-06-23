<template>
  <div
    v-if="editCourseStore.course"
    class="course-edit-sidebar"
  >
    <div class="course-edit-sidebar__subject">
      <noo-select-block v-model="editCourseStore.course.subject" />
    </div>
    <div class="course-edit-sidebar__title">
      <noo-title :size="3">
        {{ editCourseStore.course.name }}
      </noo-title>
    </div>
    <div class="course-edit-sidebar__description">
      <noo-text-block
        size="small"
        dimmed
      >
        {{ editCourseStore.course.description ?? 'Нет описания' }}
      </noo-text-block>
    </div>
    <div class="course-edit-sidebar__tree">
      <course-chapter-tree
        :course-id-or-key="editCourseStore.course._key"
        :chapters="editCourseStore.course.chapters"
        :opened-material-id-or-key="editCourseStore.material?._key"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCourseEditStore } from '../stores/course-edit.store'

const editCourseStore = useCourseEditStore()
</script>

<style scoped lang="sass"></style>
