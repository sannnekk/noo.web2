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
            @toggle="chaptersState[chapter._key] = !chaptersState[chapter._key]"
            @remove="removeChapter(chapter._key)"
          />
          <noo-if-animation>
            <div
              v-if="chaptersState[chapter._key]"
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
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { CourseConfig } from '../../config'
import { type PossiblyUnsavedChapter } from '../../types'
import treeChapter from './tree-chapter.vue'
import TreeMaterialList from './tree-material-list.vue'

interface Props {
  editable?: boolean
  level?: number
}

withDefaults(defineProps<Props>(), {
  editable: false,
  level: 0
})

const treeModel = defineModel<PossiblyUnsavedChapter[]>('tree', {
  required: true
})

const chaptersState = reactive<Record<string, boolean>>({})

function addChapter(): void {
  treeModel.value = [
    ...treeModel.value,
    {
      _entityName: 'CourseChapter',
      _key: `new-chapter-${Date.now()}`,
      order: treeModel.value.length + 1,
      title: 'Новая глава ' + (treeModel.value.length + 1),
      color: null,
      isActive: false,
      subChapters: [],
      materials: []
    }
  ]
}

function removeChapter(key: string): void {
  treeModel.value = treeModel.value.filter((chapter) => chapter._key !== key)
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
    padding-left: 1.5em
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
        padding-left: 1.5em
</style>
