<template>
  <div
    class="course-chapter-tree"
    :class="`course-chapter-tree--level-${level}`"
  >
    <div class="course-chapter-tree__sub-chapters">
      <div
        v-for="(chapter, index) in chapters"
        :key="chapter.id ?? (chapter as PossiblyUnsavedChapter)._key"
        class="course-chapter-tree__sub-chapters__item"
      >
        <noo-title
          class="course-chapter-tree__sub-chapters__item__title"
          :size="4"
          @click="toggleOpen(chapter)"
        >
          {{ getIndex(index) }}.
          {{ chapter.title }}
        </noo-title>
        <noo-if-animation>
          <div
            v-show="isChapterOpened(chapter)"
            class="course-chapter-tree__sub-chapters__item__children"
          >
            <course-chapter-tree
              :course-id-or-key="courseIdOrKey"
              :chapters="chapter.subChapters"
              :level="level + 1"
              :opened-material-id-or-key="openedMaterialIdOrKey"
              :materials="chapter.materials"
              :main-index="getIndex(index)"
            />
          </div>
        </noo-if-animation>
      </div>
    </div>
    <div
      v-if="level !== 0"
      class="course-chapter-tree__materials"
    >
      <div
        v-for="material in materials"
        :key="material.id ?? (material as PossiblyUnsavedMaterial)._key"
        class="course-chapter-tree__materials__item"
      >
        <router-link
          v-if="mode === 'view'"
          class="course-chapter-tree__materials__item__link"
          :to="{
            name: 'courses.detail.material',
            params: {
              materialId: material.id
            }
          }"
        >
          {{ material.title }}
        </router-link>
        <div
          v-else
          class="course-chapter-tree__materials__item__link"
        >
          {{ material.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  CourseChapterEntity,
  CourseMaterialEntity
} from '../api/course.types'
import type { PossiblyUnsavedChapter, PossiblyUnsavedMaterial } from '../types'

interface Props {
  courseIdOrKey?: string
  chapters?: (PossiblyUnsavedChapter | CourseChapterEntity)[]
  materials?: (PossiblyUnsavedMaterial | CourseMaterialEntity)[]
  level?: number
  openedMaterialIdOrKey?: string
  mainIndex?: string
  mode?: 'view' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  chapters: () => [],
  materials: () => [],
  level: 0,
  mode: 'view'
})

const openedChapters = ref<Record<string, boolean>>({})

watch(
  [() => props.openedMaterialIdOrKey, () => props.courseIdOrKey],
  ([openedMaterialId, courseId]) => {
    if (openedMaterialId && courseId) {
      openedChapters.value = props.chapters.reduce(
        (acc, chapter) => {
          acc[chapter.id ?? (chapter as PossiblyUnsavedChapter)._key] =
            openedChapters.value[
              chapter.id ?? (chapter as PossiblyUnsavedChapter)._key
            ] || chapterHasOpenedMaterial(chapter)

          return acc
        },
        {} as Record<string, boolean>
      )
    }
  },
  { immediate: true }
)

function chapterHasOpenedMaterial(
  _chater: PossiblyUnsavedChapter | CourseChapterEntity
): boolean {
  for (const material of _chater.materials ?? []) {
    if (
      material.id === props.openedMaterialIdOrKey ||
      (material as PossiblyUnsavedMaterial)._key === props.openedMaterialIdOrKey
    ) {
      return true
    }
  }

  if (_chater.subChapters?.length) {
    for (const subChapter of _chater.subChapters) {
      if (chapterHasOpenedMaterial(subChapter)) {
        return true
      }
    }
  }

  return false
}

function getIndex(index: number): string {
  if (props.mainIndex) {
    return `${props.mainIndex}.${index + 1}`
  }

  return `${index + 1}`
}

function toggleOpen(
  chapter: PossiblyUnsavedChapter | CourseChapterEntity
): void {
  openedChapters.value[chapter.id ?? (chapter as PossiblyUnsavedChapter)._key] =
    !openedChapters.value[
      chapter.id ?? (chapter as PossiblyUnsavedChapter)._key
    ]
}

function isChapterOpened(
  chapter: PossiblyUnsavedChapter | CourseChapterEntity
): boolean {
  return (
    openedChapters.value[
      chapter.id ?? (chapter as PossiblyUnsavedChapter)._key
    ] ?? false
  )
}
</script>

<style scoped lang="sass">
.course-chapter-tree
  user-select: none

  &--level-1
    margin-left: 1em

  &--level-2
    margin-left: 2em

  &__sub-chapters
    &__item
      margin-bottom: 1em

    &__item__title
      margin-bottom: 0.5em
      cursor: pointer

      &:hover
        color: var(--lila)

  &__materials
    &__item
      margin: 0

      &__link
        display: block
        padding: 0.3em
        color: var(--form-text-color)
        text-decoration: none

        &.router-link-active
          color: var(--lila)

        &:hover
          color: var(--lila)
          text-decoration: underline
</style>
