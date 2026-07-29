<template>
  <div
    v-if="course"
    class="course-sidebar"
  >
    <div class="course-sidebar__back-button">
      <noo-back-button
        :route="{
          name: 'courses.list'
        }"
      >
        Назад к списку курсов
      </noo-back-button>
    </div>
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
      </noo-text-block>
    </div>
    <div
      v-if="course.authors?.length"
      class="course-sidebar__authors"
    >
      <noo-text-block
        dimmed
        size="small"
        no-margin
      >
        Авторы:
      </noo-text-block>
      <div class="course-sidebar__authors__list">
        <noo-inline-user-card
          v-for="author in course.authors"
          :key="author.id"
          :user="author"
        />
      </div>
    </div>
    <div
      v-if="pinnedMaterials.length"
      class="course-sidebar__pinned"
    >
      <noo-text-block
        dimmed
        size="small"
        no-margin
      >
        Закрепленные материалы:
      </noo-text-block>
      <ul class="course-sidebar__pinned__list">
        <li
          v-for="material in pinnedMaterials"
          :key="material.id"
          class="course-sidebar__pinned__list__item"
        >
          <router-link
            :to="{
              name: 'courses.detail.material',
              params: { materialId: material.id }
            }"
            :style="{
              color: material.titleColor || 'inherit'
            }"
          >
            <noo-icon
              class="course-sidebar__pinned__list__item__icon"
              name="pin"
            />
            {{ material.title }}
          </router-link>
        </li>
      </ul>
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
          :expanded-chapter-ids="expandedChapterIds"
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
import { collectPinnedMaterials, findChapterIdPathToMaterial } from '../utils'
import MaterialSearchModal from './material-search-modal.vue'
import CourseChapterTree from './course-chapter-tree.vue'

interface Props {
  openedMaterialId?: string
}

const props = defineProps<Props>()

const router = useRouter()
const courseDetailStore = useCourseDetailStore()
const { can } = useCoursePermissions()

const course = computed(() => courseDetailStore.course.data)

// Recomputed once the course arrives, so a directly opened material link expands the
// tree down to it even though the chapters load after the first render.
const expandedChapterIds = computed(() =>
  props.openedMaterialId
    ? findChapterIdPathToMaterial(
        course.value?.chapters,
        props.openedMaterialId
      )
    : []
)

const pinnedMaterials = computed(() =>
  collectPinnedMaterials(course.value?.chapters)
)

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
    &__list
      margin: 0.2em 0 1em 0
      display: flex
      flex-direction: column
      gap: 0.4em

  &__pinned
    margin-bottom: 1em

    &__list
      list-style: none
      padding-left: 0
      margin: 0.2em 0 0 0
      display: flex
      flex-direction: column
      gap: 0.2em
      font-size: 0.9em

      &__item
        a
          color: var(--text-light)
          text-decoration: none

          &:hover
            text-decoration: underline

        a.router-link-active
          color: var(--secondary) !important

        &__icon
          --form-text-color: var(--warning)
          transform: translateY(0.1em)

  &__search
    margin-bottom: 1em
</style>
