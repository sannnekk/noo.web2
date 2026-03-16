<template>
  <noo-form-skeleton v-if="courseEditStore.isCurrentMaterialContentLoading" />
  <template v-else-if="currentContent && currentMaterial">
    <noo-title :size="3"> Данные материала </noo-title>
    <noo-grid-layout
      :cols="2"
      gap="0em"
    >
      <noo-grid-layout-item
        :col="1"
        :row="1"
        :colspan="2"
        vertical-align="center"
        horizontal-align="stretch"
      >
        <noo-text-input
          v-model="currentMaterial.title"
          label="Заголовок материала"
          :readonly="isReadonly"
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="1"
        :row="2"
        horizontal-align="stretch"
      >
        <noo-checkbox
          v-model="currentMaterial.isActive"
          :readonly="isReadonly"
          dimmed
          size="small"
        >
          {{
            currentMaterial.isActive ? 'Материал активен' : 'Материал неактивен'
          }}
        </noo-checkbox>
        <noo-if-animation>
          <noo-date-input
            v-if="!currentMaterial.isActive"
            v-model="currentMaterial.publishAt"
            class="material-content-edit-form__publish-date-input"
            label="Запланировать публикацию"
            type="datetime-local"
            :readonly="isReadonly"
            resettable
          />
        </noo-if-animation>
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="2"
        :row="2"
        horizontal-align="stretch"
      >
        <noo-color-input
          v-model="currentMaterial.titleColor"
          label="Цвет материала"
          :readonly="isReadonly"
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="1"
        :row="3"
        :colspan="2"
      >
        <noo-richtext-editor
          v-model="currentContent.content"
          label="Текст материала"
          :readonly="isReadonly"
        />
      </noo-grid-layout-item>
    </noo-grid-layout>

    <noo-title :size="3"> Прикрепленные работы </noo-title>

    <work-assignments-form
      v-model:work-assignments="currentContent.workAssignments"
      :readonly="isReadonly"
    />

    <noo-title :size="3"> Припрепленные видоеуроки НОО.Tube </noo-title>

    <noo-text-block dimmed> Блок прикрепленных видео... </noo-text-block>

    <noo-title :size="3"> Прикрепленные файлы </noo-title>

    <noo-text-block dimmed> Блок прикрепленных файлов... </noo-text-block>

    <noo-title :size="3"> Прикрепленный опрос </noo-title>

    <noo-poll-select
      v-model="currentContent.poll"
      label="Выберите опрос"
      :readonly="isReadonly"
    />
  </template>
  <noo-text-block v-else>
    Выберите материал для редактирования.
  </noo-text-block>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCourseEditStore } from '../stores/course-edit.store'
import WorkAssignmentsForm from './course-edit/work-assignments-form.vue'

const courseEditStore = useCourseEditStore()

const currentContent = computed(() => courseEditStore.currentMaterialContent)
const currentMaterial = computed(() => courseEditStore.currentMaterial)
const isReadonly = computed(() => courseEditStore.mode === 'view')

// make publishAt null if material is active
watch(
  () => currentMaterial.value?.isActive,
  (isActive) => {
    if (isActive && currentMaterial.value) {
      currentMaterial.value.publishAt = null
    }
  }
)
</script>

<style scoped lang="sass">
.material-content-edit-form
  &__publish-date-input
    margin-top: 1em
</style>
