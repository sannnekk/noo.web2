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
      v-if="courseDetailStore.materialContent.data.workAssignments?.length"
      class="course-material-content-view__work-assignments"
    >
      <noo-title
        :size="3"
        no-margin
        >Прикрепленные работы:</noo-title
      >
      <noo-text-block
        dimmed
        size="small"
      >
        Если одна из работ ниже уже была начата, то нажатие кнопки "К работе"
        откроет уже начатую работу, а не создаст новую. Если попыток было
        несколько, будет открыта последняя из них. Ниже, под работой, будет
        отображаться прогресс по работам и всем попыткам, к отдельной попытке
        можно перейти, нажав кнопку "Перейти" в таблице прогресса.
      </noo-text-block>
      <work-assignment
        v-for="assignment in courseDetailStore.materialContent.data
          .workAssignments"
        :key="assignment.id"
        :work-assignment="assignment"
      />
    </div>
    <div
      v-if="courseDetailStore.materialContent.data.medias?.length"
      class="course-material-content-view__files"
    >
      <noo-title
        :size="3"
        no-margin
        >Файлы:</noo-title
      >
      <noo-text-block
        dimmed
        size="small"
      >
        Ниже представлены файлы, прикрепленные к этому материалу. Их можно
        скачать, нажав на нужный файл
      </noo-text-block>
      <div class="course-material-content-view__files__list">
        <noo-file-card
          v-for="media in courseDetailStore.materialContent.data.medias"
          :key="media.id"
          :name="media.actualName ?? media.name ?? 'Без названия'"
          :extension="media.extension"
          :size="media.size"
          :media="media"
          :removable="false"
          downloadable
        />
      </div>
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
import WorkAssignment from '../components/work-assignment.vue'
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

  &__work-assignments
    margin-top: 2em
    display: flex
    flex-direction: column

  &__files
    margin-top: 2em
    display: flex
    flex-direction: column
    gap: 0.5em

    &__list
      display: flex
      flex-direction: column
      gap: 0.5em
</style>
