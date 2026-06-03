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
    <noo-section
      v-if="courseDetailStore.materialContent.data.workAssignments?.length"
      title="Прикрепленные работы"
      description="Если одна из работ ниже уже была начата, то нажатие кнопки &#65282;К работе&#65282;, откроет уже начатую работу, а не создаст новую. Если попыток несколько, будет открыта последняя из них. Ниже, под работой, будет отображаться прогресс по работам и всем попыткам, к отдельной попытке можно перейти, нажав кнопку &#65282;Перейти, в таблице прогресса."
    >
      <div class="course-material-content-view__work-assignments__list">
        <work-assignment
          v-for="assignment in courseDetailStore.materialContent.data
            .workAssignments"
          :key="assignment.id"
          :work-assignment="assignment"
        />
      </div>
    </noo-section>
    <noo-section
      v-if="courseDetailStore.materialContent.data.medias?.length"
      title="Прикрепленные файлы"
      description="Ниже представлены файлы, прикрепленные к этому материалу. Их можно скачать, нажав на нужный файл"
    >
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
    </noo-section>
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

  &__work-assignments,
  &__files
    &__list
      display: flex
      flex-direction: column
      gap: 0.5em
</style>
