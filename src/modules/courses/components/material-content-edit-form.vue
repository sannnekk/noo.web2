<template>
  <noo-form-skeleton v-if="courseEditStore.isCurrentMaterialContentLoading" />
  <noo-grid-layout
    v-else-if="currentContent && currentMaterial"
    :cols="6"
  >
    <noo-grid-layout-item
      :col="1"
      :row="1"
      :colspan="6"
    >
      <noo-title :size="3"> Данные материала </noo-title>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="2"
      :colspan="6"
      vertical-align="center"
      horizontal-align="stretch"
    >
      <noo-text-input
        v-model="currentMaterial.title"
        label="Заголовок материала"
      />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="3"
      :colspan="3"
      horizontal-align="stretch"
    >
      <noo-checkbox
        v-model="currentMaterial.isActive"
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
        />
      </noo-if-animation>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="4"
      :row="3"
      :colspan="3"
      horizontal-align="stretch"
    >
      <noo-color-input
        v-model="currentMaterial.titleColor"
        label="Цвет материала"
      />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="4"
      :colspan="6"
    >
      <noo-richtext-editor
        v-model="currentContent.content"
        label="Текст материала"
      />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="5"
      :colspan="6"
      vertical-align="bottom"
    >
      <noo-title :size="3"> Прикрепленные работы </noo-title>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="6"
      :colspan="6"
      horizontal-align="stretch"
    >
      <work-assignments-form
        v-model:work-assignments="currentContent.workAssignments"
      />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="7"
      :colspan="6"
    >
      <noo-title :size="3"> Припрепленные видоеуроки НОО.Tube </noo-title>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="8"
      :colspan="6"
    >
      <noo-text-block dimmed> Блок прикрепленных видео... </noo-text-block>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="9"
      :colspan="6"
    >
      <noo-title :size="3"> Прикрепленные файлы </noo-title>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="10"
      :colspan="6"
    >
      <noo-text-block dimmed> Блок прикрепленных файлов... </noo-text-block>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="11"
      :colspan="6"
    >
      <noo-title :size="3"> Прикрепленный опрос </noo-title>
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="12"
      :colspan="6"
      horizontal-align="stretch"
    >
      <noo-poll-select
        v-model="currentContent.poll"
        label="Выберите опрос"
      />
    </noo-grid-layout-item>
  </noo-grid-layout>
  <noo-text-block v-else>
    Выберите материал для редактирования.
  </noo-text-block>
  <pre
    >{{ { currentMaterial, currentContent } }}
  </pre>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCourseEditStore } from '../stores/course-edit.store'
import WorkAssignmentsForm from './course-edit/work-assignments-form.vue'

const courseEditStore = useCourseEditStore()

const currentContent = computed(() => courseEditStore.currentMaterialContent)
const currentMaterial = computed(() => courseEditStore.currentMaterial)

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
