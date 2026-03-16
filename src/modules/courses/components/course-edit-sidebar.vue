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
          <div class="course-edit-sidebar__dates">
            <noo-date-input
              v-model="editCourseStore.course.startDate"
              label="Дата начала"
              :readonly="
                editCourseStore.mode !== 'create' &&
                editCourseStore.mode !== 'edit'
              "
              resettable
            >
              <template #tooltip>
                Дата, с которой курс считается доступным для учеников.
              </template>
            </noo-date-input>
            <noo-date-input
              v-model="editCourseStore.course.endDate"
              label="Дата окончания"
              :readonly="
                editCourseStore.mode !== 'create' &&
                editCourseStore.mode !== 'edit'
              "
              resettable
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
        v-if="canSwitchToView"
        variant="secondary"
        @click="onSwitchToViewClick()"
      >
        В режим просмотра
      </noo-button>
      <noo-button
        v-if="canSwitchToEdit"
        variant="secondary"
        @click="onSwitchToEdit()"
      >
        Редактировать
      </noo-button>
      <noo-button
        v-if="canSave"
        @click="saveChangesModalOpen = true"
      >
        Сохранить
      </noo-button>
    </div>
    <save-course-changes-modal v-model:is-open="saveChangesModalOpen" />
    <noo-sure-modal
      v-model:is-open="confirmSwitchToViewModalOpen"
      @confirm="void confirmSwitchToView()"
    >
      <template #title>
        <noo-title :size="3"> Вернуться в режим просмотра </noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          У вас есть несохраненные изменения. Если вы вернетесь в режим
          просмотра, изменения будут потеряны.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Вернуться </template>
    </noo-sure-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useCourseEditStore } from '../stores/course-edit.store'
import CourseEditChapterTree from './course-edit/course-chapter-tree.vue'
import SaveCourseChangesModal from './save-course-changes-modal.vue'

const editCourseStore = useCourseEditStore()
const confirmSwitchToViewModalOpen = shallowRef(false)
const saveChangesModalOpen = shallowRef(false)

const canSwitchToView = computed(() => editCourseStore.mode === 'edit')
const canSwitchToEdit = computed(() => editCourseStore.mode === 'view')
const canSave = computed(
  () => editCourseStore.mode === 'create' || editCourseStore.mode === 'edit'
)

function onSwitchToEdit(): void {
  editCourseStore.mode = 'edit'
}

function onSwitchToViewClick(): void {
  if (editCourseStore.hasUnsavedChanges) {
    confirmSwitchToViewModalOpen.value = true

    return
  }

  editCourseStore.mode = 'view'
}

async function confirmSwitchToView(): Promise<void> {
  if (!editCourseStore.course?.id) {
    editCourseStore.mode = 'view'

    return
  }

  await editCourseStore.init(editCourseStore.course.id)
  editCourseStore.mode = 'view'
}
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

  &__tree
    padding: 1em 0

  &__actions
    padding-top: 1em
    display: flex
    flex-direction: row
    justify-content: flex-end
    gap: 10px
</style>
