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
      <course-material-reactions
        v-if="can(CoursePermissions.reactToMaterial)"
      />
    </div>
    <noo-section
      v-if="courseDetailStore.materialContent.data.nooTubeVideos?.length"
      title="Прикрепленные видео"
      description="Ниже представлены видео, прикрепленные к этому материалу."
    >
      <noo-grid-layout
        :cols="3"
        gap="0.2em"
      >
        <noo-grid-layout-item
          v-for="(video, index) in courseDetailStore.materialContent.data
            .nooTubeVideos"
          :key="video.id"
          :col="(index % 3) + 1"
          :row="Math.floor(index / 3) + 1"
        >
          <noo-video-card :video="video" />
        </noo-grid-layout-item>
      </noo-grid-layout>
    </noo-section>
    <noo-section
      v-if="courseDetailStore.materialContent.data.workAssignments?.length"
      title="Прикрепленные работы"
      description="Если одна из работ ниже уже была начата, то нажатие кнопки &#65282;К работе&#65282;, откроет уже начатую работу, а не создаст новую. Если попыток несколько, будет открыта последняя из них. Ниже, под работой, будет отображаться прогресс по работам и всем попыткам, к отдельной попытке можно перейти, нажав кнопку &#65282;Перейти&#65282;, в таблице прогресса."
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
      <div
        v-if="can(CoursePermissions.viewMaterialStatistics)"
        class="course-material-content-view__files__actions"
      >
        <noo-button
          variant="secondary"
          size="small"
          @click="isDownloadStatisticsOpen = true"
        >
          Статистика скачиваний
        </noo-button>
      </div>
    </noo-section>
    <noo-section
      v-if="courseDetailStore.materialContent.data.poll"
      title="Прикрепленный опрос"
      description=""
    >
      <div class="course-material-content-view__poll">
        <div class="course-material-content-view__poll__info">
          <noo-text-block no-margin>
            {{ courseDetailStore.materialContent.data.poll.title }}
          </noo-text-block>
          <noo-text-block
            dimmed
            no-margin
            size="small"
          >
            {{ courseDetailStore.materialContent.data.poll.description }}
          </noo-text-block>
          <noo-text-block
            v-if="
              DateHelpers.isInFuture(
                courseDetailStore.materialContent.data.poll.expiresAt
              )
            "
            dimmed
            no-margin
            size="small"
          >
            Опрос открыт до:
            <noo-date
              :value="courseDetailStore.materialContent.data.poll?.expiresAt"
              include-time
              timezones="both"
            />
          </noo-text-block>
          <noo-text-block
            v-else
            dimmed
            no-margin
            size="small"
          >
            Опрос уже истек и недоступен для прохождения
          </noo-text-block>
        </div>
        <div class="course-material-content-view__poll__actions">
          <noo-button
            v-if="can(CoursePermissions.participateInPoll)"
            variant="primary"
            :to="{
              name: 'polls.participate',
              params: {
                pollId: courseDetailStore.materialContent.data.poll.id
              }
            }"
          >
            Перейти к опросу
          </noo-button>
        </div>
      </div>
    </noo-section>
    <material-file-downloads-modal
      v-if="can(CoursePermissions.viewMaterialStatistics)"
      v-model:is-open="isDownloadStatisticsOpen"
      :material-id="props.materialId"
      :material-title="courseDetailStore.currentMaterial.title"
    />
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
import CourseMaterialReactions from '../components/course-material-reactions.vue'
import MaterialFileDownloadsModal from '../components/material-file-downloads-modal.vue'
import WorkAssignment from '../components/work-assignment.vue'
import { debounce } from 'lodash'
import { ref, watch } from 'vue'
import { DateHelpers } from '@/core/utils/dates'
import { CoursePermissions, useCoursePermissions } from '../permissions'
import { useCourseDetailStore } from '../stores/course-detail.store'

export interface CourseMaterialViewProps {
  materialId: string
}

const props = defineProps<CourseMaterialViewProps>()

const courseDetailStore = useCourseDetailStore()
const { can } = useCoursePermissions()

const isDownloadStatisticsOpen = ref(false)

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
    min-height: 500px
    gap: 1em

    &__icon
      font-size: 4em

  &__work-assignments,
  &__files
    &__list
      display: flex
      flex-direction: column
      gap: 0.5em

    &__actions
      display: flex
      justify-content: flex-end
      margin-top: 0.75em

  &__poll
    display: flex
    align-items: center
    justify-content: space-between
    gap: 1em

    &__info
      flex: 1

    &__actions
      display: flex
      align-items: center
</style>
