<template>
  <div
    v-if="course"
    class="course-sidebar"
  >
    <div class="course-sidebar__subject">
      <noo-subject-block :subject="course.subject" />
    </div>
    <div class="course-sidebar__title">
      <noo-title :size="2">
        {{ course.name }}
      </noo-title>
    </div>
    <div class="course-sidebar__description">
      <noo-text-block
        size="small"
        dimmed
      >
        {{ course.description }}
      </noo-text-block>
    </div>
    <div class="course-sidebar__actions">
      <noo-text-block size="small">
        <noo-inline-link
          v-if="true /* authStore.roleIsOneOf(['teacher', 'admin']) */"
          class="course-sidebar__actions__action"
          :to="{
            name: 'courses.students',
            params: { courseId: course.id }
          }"
        >
          Ученики курса
        </noo-inline-link>
        <noo-inline-link
          v-if="true /* authStore.roleIsOneOf(['teacher', 'admin']) */"
          class="course-sidebar__actions__action"
          :to="{
            name: 'courses.edit',
            params: { courseId: course.id }
          }"
        >
          Редактировать курс
        </noo-inline-link>
        <noo-inline-link
          v-if="true /* authStore.roleIsOneOf(['teacher', 'admin']) */"
          class="course-sidebar__actions__action"
          @click="materialSearchModalOpened = true"
        >
          Поиск материалов
        </noo-inline-link>
      </noo-text-block>
    </div>
    <div
      v-if="course.authors?.length"
      class="course-sidebar__authors"
    >
      <noo-text-block
        dimmed
        class="course-sidebar__authors__title"
        size="small"
      >
        Авторы:
      </noo-text-block>
      <noo-inline-user-card-list :users="course.authors ?? []" />
    </div>
    <div class="course-sidebar__chapter-tree">
      <noo-scrollable-block max-height="60vh">
        <course-chapter-tree
          :course-id="course.id"
          :chapters="course.chapters ?? []"
          :opened-material-id-or-key="courseDetailStore.currentMaterial?.id"
        />
      </noo-scrollable-block>
    </div>
    <div class="course-sidebar__course-link">
      <noo-text-input
        label="Ссылка на курс"
        :model-value="currentPageUrl"
        copy-button
        readonly
      />
    </div>
  </div>
  <material-search-modal
    v-model:is-open="materialSearchModalOpened"
    :chapters="course?.chapters"
  />
</template>

<script setup lang="ts">
import { usePageUrl } from '@/core/composables/usePageUrl'
import { useAuthStore } from '@/core/stores/auth.store'
import { computed, shallowRef } from 'vue'
import { useCourseDetailStore } from '../stores/course-detail.store'
import CourseChapterTree from './course-chapter-tree.vue'
import MaterialSearchModal from './material-search-modal.vue'

interface Props {
  openedMaterialId?: string
}

defineProps<Props>()

const courseDetailStore = useCourseDetailStore()
const authStore = useAuthStore()

const course = computed(() => courseDetailStore.course.data)

const { currentPageUrl } = usePageUrl()

const materialSearchModalOpened = shallowRef<boolean>(false)
</script>

<style scoped lang="sass">
.course-sidebar
  &__actions
    &__action
      display: block

  &__authors
    &__title
      margin-bottom: 0
</style>
