<template>
  <div
    class="tree-chapter"
    :class="{
      'tree-chapter-list--planned': chapterModel.publishAt !== null,
      'tree-chapter--active':
        chapterModel.publishAt === null && chapterModel.isActive,
      'tree-chapter--highlighted': highlighted
    }"
    @click="$emit('toggle')"
  >
    <div
      class="tree-chapter__active-toggle"
      @click.stop="chapterModel.isActive = !chapterModel.isActive"
    ></div>
    <div class="tree-chapter__drag-handle">
      <noo-icon name="drag-handle" />
    </div>
    <div class="tree-chapter__title">
      <div class="tree-chapter__title__info">
        Глава | {{ chapterModel.materials.length }}
        {{
          pluralize(chapterModel.materials.length, [
            'материал',
            'материала',
            'материалов'
          ])
        }}
        | {{ chapterModel.subChapters.length }}
        {{
          pluralize(chapterModel.subChapters.length, [
            'подглава',
            'подглавы',
            'подглав'
          ])
        }}
      </div>
      <noo-title
        :size="5"
        no-margin
      >
        {{ chapterModel.title }}
      </noo-title>
    </div>
    <div
      v-if="editable"
      class="tree-chapter__actions"
    >
      <noo-icon
        name="edit"
        hoverable
      />
      <noo-icon
        name="delete"
        hoverable
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PossiblyUnsavedChapter } from '../../types'
import { pluralize } from '@/core/utils/lang.utils'

interface Props {
  editable?: boolean
  highlighted?: boolean
}

interface Emits {
  (e: 'remove'): void
  (e: 'toggle'): void
}

defineProps<Props>()
defineEmits<Emits>()

const chapterModel = defineModel<PossiblyUnsavedChapter>('chapter', {
  required: true
})
</script>

<style scoped lang="sass">
.tree-chapter
  border-radius: var(--border-radius)
  border: var(--light-background-color) 1px solid
  background-color: var(--light-background-color)
  display: flex
  gap: 0.5em
  align-items: center
  cursor: pointer
  border-left: 4px solid var(--text-light)

  &--active
    border-left-color: var(--success)

  &--planned
    border-left-color: var(--warning)

  &--highlighted
    background-color: var(--secondary-light)
    border-color: var(--secondary)

  &:hover
    background-color: var(--form-background)

  &__active-toggle
    width: 0.5em
    height: 3em
    background-color: transparent
    transition: all 0.2s ease-in-out

  &__drag-handle
    cursor: grab
    padding-top: 0.2em
    user-select: none

  &__title
    flex-grow: 1
    padding: 0.5em 0.7em

    &__info
      font-size: 0.7em
      color: var(--text-light)

  &__actions
    display: flex
    flex-direction: row
    align-items: center
    gap: 0.5em
    padding-right: 0.5em
</style>
