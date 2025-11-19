<template>
  <div
    v-if="editCourseStore.course"
    class="course-edit-sidebar"
  >
    <noo-title :size="3">
      {{ editCourseStore.course.name }}
    </noo-title>
    <noo-tabs-layout>
      <template #tab-title-general> Общая информация </template>
      <template #tab-general>
        <div class="course-edit-sidebar__general">
          <div class="course-edit-sidebar__subject">
            <noo-subject-block
              v-if="editCourseStore.mode === 'view'"
              :subject="editCourseStore.course.subject ?? null"
            />
            <noo-subject-select
              v-else
              v-model:subject="editCourseStore.course.subject"
              v-model:subject-id="editCourseStore.course.subjectId"
            />
          </div>
          <div class="course-edit-sidebar__title">
            <noo-title
              v-if="editCourseStore.mode === 'view'"
              :size="3"
            >
              {{ editCourseStore.course.name }}
            </noo-title>
            <noo-text-input
              v-else
              v-model="editCourseStore.course.name"
              label="Название курса"
            />
          </div>
          <div class="course-edit-sidebar__description">
            <noo-text-block
              v-if="editCourseStore.mode === 'view'"
              size="small"
              dimmed
            >
              {{ editCourseStore.course.description ?? 'Нет описания' }}
            </noo-text-block>
            <noo-textarea
              v-else
              v-model="editCourseStore.course.description"
              label="Описание курса"
            />
          </div>
        </div>
      </template>
      <template #tab-title-tree> Главы </template>
      <template #tab-tree>
        <div class="course-edit-sidebar__tree">
          <course-edit-chapter-tree
            v-model:tree="editCourseStore.course.chapters"
            :editable="
              editCourseStore.mode === 'edit' ||
              editCourseStore.mode === 'create'
            "
          />
        </div>
      </template>
    </noo-tabs-layout>
    <div class="course-edit-sidebar__actions">
      <noo-button
        v-if="editCourseStore.mode === 'edit'"
        variant="secondary"
      >
        В режим просмотра
      </noo-button>
      <noo-button
        v-if="editCourseStore.mode === 'view'"
        variant="secondary"
      >
        Редактировать
      </noo-button>
      <noo-button> Сохранить </noo-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCourseEditStore } from '../stores/course-edit.store'
import CourseEditChapterTree from './course-edit/course-chapter-tree.vue'

const editCourseStore = useCourseEditStore()
</script>

<style scoped lang="sass">
.course-edit-sidebar
  &__general
    padding: 1em 0

  &__tree
    padding: 1em 0

  &__actions
    padding-top: 1em
    display: flex
    flex-direction: row
    justify-content: flex-end
    gap: 10px
</style>
