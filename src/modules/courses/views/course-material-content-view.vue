<template>
  <div
    v-if="
      courseDetailStore.materialContent.data &&
      courseDetailStore.currentMaterial
    "
    class="course-material-content-view"
  >
    <noo-title
      :size="1"
      class="course-material-content-view__title"
    >
      {{ courseDetailStore.currentMaterial.title }}
    </noo-title>
    <div class="course-material-content-view__content">
      <noo-richtext-block
        :value="courseDetailStore.materialContent.data.content"
      />
    </div>
    <div
      v-if="courseDetailStore.materialContent.data.files?.length"
      class="course-material-content-view__files"
    >
      <noo-title :size="3"> Прикрепленные файлы </noo-title>
      <noo-file-list :files="courseDetailStore.materialContent.data.files" />
    </div>
  </div>
  <div
    v-else-if="courseDetailStore.materialContent.isLoading"
    class="course-material-content-view__loading"
  >
    <noo-loader-icon
      class="course-material-content-view__loading__icon"
      contrast
    />
    <noo-text-block
      class="course-material-content-view__loading__text"
      dimmed
    >
      Загрузка материала...
    </noo-text-block>
  </div>
  <div
    v-else
    class="course-material-content-view__not-found"
  >
    <noo-text-block> Материал не найден </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash'
import { watch } from 'vue'
import { useCourseDetailStore } from '../stores/course-detail.store'

export interface CourseMaterialViewProps {
  materialId: string
}

const props = defineProps<CourseMaterialViewProps>()

const courseDetailStore = useCourseDetailStore()

watch(
  () => props.materialId,
  debounce((newMaterialId) => {
    courseDetailStore.setCurrentMaterial(newMaterialId)
    courseDetailStore.materialContent.execute()
  }, 250),
  { immediate: true }
)
</script>

<style lang="sass" scoped>
.course-material-content-view
  &__loading
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    gap: 1em

    &__icon
      font-size: 4em
</style>
