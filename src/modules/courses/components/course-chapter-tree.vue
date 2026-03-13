<template>
  <div class="course-chapter-tree">
    <ul class="course-chapter-tree__chapters">
      <li
        v-for="chapter in chapters"
        :key="chapter.id"
        class="course-chapter-tree__item"
        :class="{
          'course-chapter-tree__item--opened': chaptersState[chapter.id]
        }"
      >
        <div
          class="course-chapter-tree__item__header"
          @click="chaptersState[chapter.id] = !chaptersState[chapter.id]"
        >
          <noo-list-opener-icon
            :opened="chaptersState[chapter.id]"
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
            v-if="chaptersState[chapter.id]"
            class="course-chapter-tree__item__content"
          >
            <course-chapter-tree
              :chapters="chapter.subChapters ?? []"
              :materials="chapter.materials"
              :initially-selected-material-id="initiallySelectedMaterialId"
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
      >
        <router-link
          :to="{
            name: 'courses.detail.material',
            params: { materialId: material.id }
          }"
        >
          {{ material.title }}
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
import { reactive } from 'vue'
import { findChapterByMaterialId } from '../utils.ts'

interface Props {
  chapters: CourseChapterEntity[]
  materials?: CourseMaterialEntity[]
  initiallySelectedMaterialId?: string
}

const props = defineProps<Props>()

const chaptersState = reactive<Record<string, boolean>>({})

if (props.initiallySelectedMaterialId) {
  const chapter = findChapterByMaterialId(
    props.chapters,
    props.initiallySelectedMaterialId
  )

  if (chapter) {
    chaptersState[chapter.id] = true
  }
}
</script>

<style lang="sass" scoped>
.course-chapter-tree
  &__chapters
    list-style: none
    padding-left: 0

  &__materials
    list-style: none
    padding-left: 2em
    font-size: 0.9em

    a
      cursor: pointer
      color: var(--text-light)
      text-decoration: none

      &:hover
        color: var(--secondary)

  &__item
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
