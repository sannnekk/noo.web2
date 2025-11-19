<template>
  <div
    class="tree-chapter"
    @click="$emit('toggle')"
  >
    <div class="tree-chapter__drag-handle">
      <noo-icon name="drag-handle" />
    </div>
    <div class="tree-chapter__title">
      <noo-title
        :size="5"
        no-margin
      >
        {{ chapter.title }}
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

interface Props {
  chapter: PossiblyUnsavedChapter
  editable?: boolean
}

interface Emits {
  (e: 'remove'): void
  (e: 'toggle'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped lang="sass">
.tree-chapter
  padding: 0.5em 0.7em
  border-radius: var(--border-radius)
  border: var(--light-background-color) 1px solid
  background-color: var(--light-background-color)
  display: flex
  gap: 0.5em
  align-items: center
  cursor: pointer

  &:hover
    background-color: var(--form-background)

  &__drag-handle
    cursor: grab
    padding-top: 0.2em
    user-select: none

  &__title
    flex-grow: 1

  &__actions
    display: flex
    flex-direction: row
    align-items: center
    gap: 0.5em
</style>
