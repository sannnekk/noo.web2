<template>
  <div
    class="course-edit-chapter-tree"
    :class="`course-edit-chapter-tree--level-${level}`"
  >
    <noo-draggable-list
      v-model="treeModel"
      item-key="_key"
      gap="0.5em"
      :disabled="!editable"
      handle=".tree-chapter__drag-handle"
      group="chapters"
      @reorder="adjustOrder()"
    >
      <template #default="{ item: chapter }">
        <div class="course-edit-chapter-tree__item">
          <tree-chapter
            :chapter="chapter"
            :editable="editable"
            :highlighted="highlightedKey === chapter._key"
            @toggle="chaptersState[chapter._key] = !chaptersState[chapter._key]"
            @remove="removeChapter(chapter._key)"
          />
          <noo-if-animation>
            <div
              v-if="getChapterOpened(chapter._key)"
              class="course-edit-chapter-tree__item__content"
            >
              <div
                v-if="level < CourseConfig.maxChaperDepth"
                class="course-edit-chapter-tree__item__subchapters"
              >
                <course-chapter-tree
                  v-model:tree="chapter.subChapters"
                  :level="level + 1"
                  :editable="editable"
                  :all-opened="allOpened"
                  :highlighted-key="highlightedKey"
                />
              </div>
              <div
                class="course-edit-chapter-tree__item__materials"
                :class="`course-edit-chapter-tree__item__materials--level-${level + 1}`"
              >
                <tree-material-list
                  v-model:materials="chapter.materials"
                  :editable="editable"
                  :level="level + 1"
                  :highlighted-key="highlightedKey"
                />
              </div>
            </div>
          </noo-if-animation>
        </div>
      </template>
    </noo-draggable-list>
    <div
      v-if="editable"
      class="course-edit-chapter-tree__item__chapter course-edit-chapter-tree__item__chapter__add"
      @click="addChapter()"
    >
      {{ level === 0 ? 'Добавить главу' : 'Добавить подглаву' }}
    </div>
    <div
      v-if="level === 0"
      class="course-edit-chapter-tree__legend"
    >
      <noo-legend
        :items="[
          { color: 'var(--success)', label: 'Активный материал' },
          { color: 'var(--warning)', label: 'Запланирована публикация' },
          { color: 'var(--text-light)', label: 'Неактивный материал' }
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { CourseService } from '../../api/course.service'
import { CourseConfig } from '../../config'
import { useCourseEditStore } from '../../stores/course-edit.store'
import { type PossiblyUnsavedChapter } from '../../types'
import treeChapter from './tree-chapter.vue'
import TreeMaterialList from './tree-material-list.vue'

interface Props {
  editable?: boolean
  level?: number
  allOpened?: boolean
  highlightedKey?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  level: 0,
  allOpened: false,
  highlightedKey: null
})

const treeModel = defineModel<PossiblyUnsavedChapter[]>('tree', {
  required: true
})

const chaptersState = reactive<Record<string, boolean>>({})
const courseEditStore = useCourseEditStore()

const getChapterOpened = computed(() => (chapterKey: string) => {
  if (props.allOpened) {
    return true
  }

  return chaptersState[chapterKey] ?? false
})

function addChapter(): void {
  treeModel.value = [
    ...treeModel.value,
    CourseService.createChapterDraft(treeModel.value.length + 1)
  ]
}

function removeChapter(key: string): void {
  const removedChapter = treeModel.value.find((chapter) => chapter._key === key)

  if (removedChapter) {
    markChapterMaterialsRemoved(removedChapter)
  }

  treeModel.value = treeModel.value.filter((chapter) => chapter._key !== key)
}

function markChapterMaterialsRemoved(chapter: PossiblyUnsavedChapter): void {
  for (const material of chapter.materials ?? []) {
    courseEditStore.markMaterialRemoved(material._key, material.contentId)
  }

  for (const subChapter of chapter.subChapters ?? []) {
    markChapterMaterialsRemoved(subChapter)
  }
}

function adjustOrder(): void {
  treeModel.value = treeModel.value.map((chapter, index) => ({
    ...chapter,
    order: index + 1
  }))
}
</script>

<style scoped lang="sass">
.course-edit-chapter-tree
  display: flex
  flex-direction: column
  gap: 0.5em

  &--level-1,
  &--level-2,
  &--level-3,
  &--level-4,
  &--level-5
    padding-left: 2em
    gap: 0.25em

  &__item
    &__chapter
      &__add
        cursor: pointer
        border: none
        display: inline-block
        background-color: unset
        font-size: 0.8em
        border-radius: var(--border-radius)
        padding: 0.2em 0.7em

        &:hover
          background-color: var(--light-background-color)

    &__subchapters
      padding: 0.25em 0 0 0

    &__materials
      &--level-1,
      &--level-2,
      &--level-3,
      &--level-4,
      &--level-5
        padding-left: 2em

  &__legend
    margin-top: 1em
</style>
