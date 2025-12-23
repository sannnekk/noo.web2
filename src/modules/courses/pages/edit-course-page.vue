<template>
  <div class="edit-course-page">
    <noo-sidebar-layout wide-sidebar>
      <template #sidebar>
        <div
          v-if="editCourseStore.mode === 'loading'"
          class="edit-course-page__sidebar__loading"
        >
          <noo-sidebar-skeleton />
        </div>
        <div
          v-else-if="editCourseStore.mode === 'error'"
          class="edit-course-page__sidebar__error"
        >
          <noo-error-block
            :try-again="() => editCourseStore.init()"
            centered
            with-image
          >
            Не удалось загрузить курс.
          </noo-error-block>
        </div>
        <div
          v-else
          class="edit-course-page__sidebar"
        >
          <course-edit-sidebar />
        </div>
      </template>
      <template #content>
        <div
          v-if="editCourseStore.mode === 'loading'"
          class="edit-course-page__content__loading"
        >
          <noo-form-skeleton />
        </div>
        <div
          v-else-if="editCourseStore.mode === 'error'"
          class="edit-course-page__content__error"
        >
          <noo-error-block
            :try-again="() => editCourseStore.init()"
            centered
            with-image
          >
            Не удалось загрузить курс.
          </noo-error-block>
        </div>
        <div
          v-else
          class="edit-course-page__content"
        >
          <material-content-edit-form />
        </div>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import courseEditSidebar from '../components/course-edit-sidebar.vue'
import materialContentEditForm from '../components/material-content-edit-form.vue'
import { useCourseEditStore } from '../stores/course-edit.store'

export interface EditCoursePageProps {
  courseId?: string
}

defineProps<EditCoursePageProps>()

const editCourseStore = useCourseEditStore()
</script>

<style scoped lang="sass"></style>
