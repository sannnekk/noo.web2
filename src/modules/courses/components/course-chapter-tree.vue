<template>
  <div class="course-chapter-tree">
    <ul class="course-chapter-tree__chapters">
      <li
        v-for="chapter in chapters"
        :key="chapter.id"
        class="course-chapter-tree__item"
        :class="{
          'course-chapter-tree__item--opened': getChapterOpened(chapter.id),
          'course-chapter-tree__item--highlighted':
            chapter.id === highlightedKey
        }"
      >
        <div
          class="course-chapter-tree__item__header"
          @click="toggleChapter(chapter.id)"
        >
          <noo-list-opener-icon
            :opened="getChapterOpened(chapter.id)"
            class="course-chapter-tree__item__list-opener"
          />
          <noo-title
            :size="4"
            no-margin
          >
            {{ chapter.title }}
          </noo-title>
        </div>
        <noo-if-animation>
          <div
            v-if="getChapterOpened(chapter.id)"
            class="course-chapter-tree__item__content"
          >
            <course-chapter-tree
              :chapters="chapter.subChapters ?? []"
              :materials="chapter.materials"
              :expanded-chapter-ids="expandedChapterIds"
              :all-opened="allOpened"
              :highlighted-key="highlightedKey"
            />
          </div>
        </noo-if-animation>
      </li>
    </ul>
    <ul class="course-chapter-tree__materials">
      <li
        v-for="material in materials ?? []"
        :key="material.id"
        class="course-chapter-tree__item"
        :class="{
          'course-chapter-tree__item--highlighted':
            material.id === highlightedKey
        }"
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
          {{ material.title }}
          <span
            v-if="material.myReaction"
            class="course-chapter-tree__item__reaction"
          >
            {{ courseMaterialReactionEmojis[material.myReaction] }}
          </span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type {
  CourseChapterEntity,
  CourseMaterialEntity
} from '../api/course.types.ts'
import { reactive, computed, watch } from 'vue'
import { courseMaterialReactionEmojis } from '../constants.ts'

interface Props {
  chapters: CourseChapterEntity[]
  materials?: CourseMaterialEntity[]
  /**
   * Chapters to open regardless of what the user toggled, e.g. the ancestor chain
   * of the currently opened material. Toggling such a chapter overrides it until
   * the chain itself changes.
   */
  expandedChapterIds?: string[]
  allOpened?: boolean
  highlightedKey?: string | null
}

const props = defineProps<Props>()

const toggledChapters = reactive<Record<string, boolean>>({})

const expandedChapterIdSet = computed(
  () => new Set(props.expandedChapterIds ?? [])
)

const getChapterOpened = computed(() => (chapterId: string) => {
  if (props.allOpened) {
    return true
  }

  return toggledChapters[chapterId] ?? expandedChapterIdSet.value.has(chapterId)
})

function toggleChapter(chapterId: string): void {
  toggledChapters[chapterId] = !getChapterOpened.value(chapterId)
}

// A new chain (another material was opened) takes precedence over earlier manual
// toggles, so a chapter the user collapsed before opens again when it leads to the
// material that is now selected.
watch(
  () => props.expandedChapterIds,
  (chapterIds) => {
    for (const chapterId of chapterIds ?? []) {
      delete toggledChapters[chapterId]
    }
  }
)
</script>

<style lang="sass" scoped>
.course-chapter-tree
  &__chapters
    list-style: none
    padding-left: 0

  &__materials
    list-style: none
    padding-left: 1.7em
    font-size: 0.9em

  &__item
    &--highlighted, a.router-link-active
      color: var(--secondary) !important

    a
      cursor: pointer
      color: var(--text-light)
      text-decoration: none

      &:hover
        text-decoration: underline

    &__reaction
      font-size: 0.85em
      margin-left: 0.2em

    &__list-opener
      font-size: 0.8em
      color: var(--text-light)

    &__header
      display: flex
      flex-direction: row
      align-items: center
      gap: 0.5em
      cursor: pointer
      font-size: 0.9em

      &:hover
        color: var(--secondary)

    &__content
      padding-left: 1em
</style>
