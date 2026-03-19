<template>
  <div
    v-if="course"
    class="course-sidebar"
  >
    <div class="course-sidebar__subject">
      <noo-subject-block :subject="course.subject ?? null" />
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
          v-if="can(CoursePermissions.manageCourse)"
          class="course-sidebar__actions__action"
          :to="{
            name: 'courses.students',
            params: { courseId: course.id }
          }"
        >
          Ученики курса
        </noo-inline-link>
        <noo-inline-link
          v-if="can(CoursePermissions.manageCourse)"
          class="course-sidebar__actions__action"
          :to="{
            name: 'courses.edit',
            params: { courseId: course.id }
          }"
        >
          Редактировать курс
        </noo-inline-link>
        <noo-inline-link
          v-if="can(CoursePermissions.manageCourse)"
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
      <div class="course-sidebar__authors__list">
        <noo-text-block
          v-for="author in course.authors"
          :key="author.id"
          size="small"
          dimmed
          no-margin
        >
          {{ author.name || author.username || author.email || author.id }}
        </noo-text-block>
      </div>
    </div>
    <div class="course-sidebar__chapter-tree">
      <div class="course-sidebar__search">
        <noo-search-input
          v-model="chapterFilter.search.value"
          @keydown="chapterFilter.onSearchKeydown"
        />
      </div>
      <noo-scrollable-block max-height="60vh">
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
        <course-chapter-tree
          v-else
          :chapters="chapterFilter.filteredChapters.value"
          :initially-selected-material-id="openedMaterialId"
          :all-opened="chapterFilter.isFiltering.value"
          :highlighted-key="chapterFilter.highlightedKey.value"
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
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseChapterFilter } from '../composables/useCourseChapterFilter'
import { CoursePermissions, useCoursePermissions } from '../permissions'
import { useCourseDetailStore } from '../stores/course-detail.store'
import MaterialSearchModal from './material-search-modal.vue'
import CourseChapterTree from './course-chapter-tree.vue'

interface Props {
  openedMaterialId?: string
}

defineProps<Props>()

const router = useRouter()
const courseDetailStore = useCourseDetailStore()
const { can } = useCoursePermissions()

const course = computed(() => courseDetailStore.course.data)

const chapterFilter = useCourseChapterFilter({
  chapters: () => course.value?.chapters,
  onSelect: (item) => {
    if (item.type === 'material') {
      router.push({
        name: 'courses.detail.material',
        params: { materialId: item.key }
      })
    }
  }
})

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

    &__list
      display: flex
      flex-direction: column
      gap: 0.1em

  &__search
    margin-bottom: 1em
</style>
