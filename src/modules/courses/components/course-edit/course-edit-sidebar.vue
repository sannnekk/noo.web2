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
            <noo-subject-select
              v-model:subject="editCourseStore.course.subject"
              v-model:subject-id="editCourseStore.course.subjectId"
            />
          </div>
          <div class="course-edit-sidebar__title">
            <noo-text-input
              v-model="editCourseStore.course.name"
              label="Название курса"
            />
          </div>
          <div class="course-edit-sidebar__description">
            <noo-textarea
              v-model="editCourseStore.course.description"
              label="Описание курса"
            />
          </div>
          <div class="course-edit-sidebar__dates">
            <noo-date-input
              v-model="editCourseStore.course.startDate"
              label="Дата начала"
              resettable
            >
              <template #tooltip>
                Дата, с которой курс считается доступным для учеников.
              </template>
            </noo-date-input>
            <noo-date-input
              v-model="editCourseStore.course.endDate"
              label="Дата окончания"
              resettable
            />
          </div>
        </div>
      </template>
      <template #tab-title-tree> Главы </template>
      <template #tab-tree>
        <div class="course-edit-sidebar__search">
          <noo-search-input
            v-model="chapterFilter.search.value"
            @keydown="chapterFilter.onSearchKeydown"
          />
        </div>
        <div class="course-edit-sidebar__tree">
          <noo-text-block
            v-if="
              chapterFilter.isFiltering.value &&
              chapterFilter.filteredChapters.value.length === 0
            "
            dimmed
            size="small"
            no-margin
          >
            Ничего не найдено
          </noo-text-block>
          <course-edit-chapter-tree
            v-else-if="chapterFilter.isFiltering.value"
            :tree="chapterFilter.filteredChapters.value"
            :editable="false"
            :all-opened="true"
            :highlighted-key="chapterFilter.highlightedKey.value"
          />
          <course-edit-chapter-tree
            v-else
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
        :disabled="!canSave"
        variant="primary"
        @click="saveChangesModalOpen = true"
      >
        Сохранить
      </noo-button>
    </div>
    <save-course-changes-modal v-model:is-open="saveChangesModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useCourseChapterFilter } from '../../composables/useCourseChapterFilter'
import { useCourseEditStore } from '../../stores/course-edit.store.ts'
import CourseEditChapterTree from './course-chapter-tree.vue'
import SaveCourseChangesModal from './save-course-changes-modal.vue'

const editCourseStore = useCourseEditStore()
const saveChangesModalOpen = shallowRef(false)

const chapterFilter = useCourseChapterFilter({
  chapters: () => editCourseStore.course?.chapters,
  onSelect: (item) => {
    if (item.type === 'material') {
      editCourseStore.selectMaterial(item.key)
    }
  }
})

const canSave = computed(
  () => editCourseStore.mode === 'create' || editCourseStore.mode === 'edit'
)
</script>

<style scoped lang="sass">
.course-edit-sidebar
  &__general
    padding: 1em 0

  &__dates
    display: flex
    flex-direction: row
    gap: 1em

    & > *
        flex: 1

  &__search
    margin-top: 1em

  &__tree
    padding: 1em 0

  &__actions
    padding-top: 1em
    display: flex
    flex-direction: row
    justify-content: flex-end
    gap: 10px
</style>
