<template>
  <div class="task-grid">
    <noo-scrollable-block max-height="250px">
      <noo-draggable-list
        v-model="tasks"
        list-class="task-grid__grid"
        item-key="_key"
        :disabled="readonly"
        @reorder="$emit('reorder')"
      >
        <template #default="{ item: task }">
          <div
            class="task-grid__grid__item"
            :class="{
              'task-grid__grid__item--active': task._key === activeTaskKey,
              'task-grid__grid__item--invalid': invalidTaskKeys.includes(
                task._key
              ),
              'task-grid__grid__item--draggable': !readonly,
              [`task-grid__grid__item--${task.type}`]: true
            }"
            :title="readonly ? undefined : 'Перетащите, чтобы поменять порядок'"
            @click="$emit('task-clicked', task)"
          >
            <noo-new-tag
              v-if="!task.id && showNewLabel"
              class="task-grid__grid__item__new-label"
            />
            <span class="task-grid__grid__item__number">{{ task.order }}</span>
          </div>
        </template>
      </noo-draggable-list>
    </noo-scrollable-block>
    <div class="task-grid__legend">
      <noo-legend :items="legend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { taskTypes } from '../constants'
import type { PossiblyUnsavedWorkTask } from '../types'
import { validateWorkTaskState } from '../utils'

interface LegendItem {
  color: string
  label: string
}

interface Props {
  activeTaskKey?: string
  showNewLabel?: boolean
  /** Without this the grid is a picker only; with it, tasks can be dragged into order. */
  readonly?: boolean
}

interface Emits {
  (event: 'task-clicked', task: PossiblyUnsavedWorkTask): void
  (event: 'reorder'): void
}

defineProps<Props>()

defineEmits<Emits>()

/**
 * The tasks, in the sequence the grid shows them. Dragging rewrites the array;
 * the numbers on the squares only catch up once whoever owns the list has
 * renumbered them, which is what `reorder` is for.
 */
const tasks = defineModel<PossiblyUnsavedWorkTask[]>('tasks', {
  required: true
})

const legend = computed<LegendItem[]>(() => {
  return taskTypes.filter((type) =>
    tasks.value.some((task) => task.type === type.value)
  )
})

const invalidTaskKeys = computed(() => {
  return tasks.value
    .filter((task) => !validateWorkTaskState(task).isValid)
    .map((task) => task._key)
})

const taskTypeColors = taskTypes.reduce(
  (acc, type) => {
    acc[type.value] = type.color

    return acc
  },
  {} as Record<string, string>
)
</script>

<style scoped lang="sass">
.task-grid
  &__legend
    margin-top: 0.5em

  // The grid container is rendered by noo-draggable-list, so it is out of this
  // component's scope and has to be reached into.
  &:deep(.task-grid__grid)
    display: grid
    grid-template-columns: repeat(6, 1fr)
    gap: 0.75em
    padding: 0.5em 0.3em 0.5em 0

  &__grid
    &__item
      display: flex
      flex-direction: column
      justify-content: center
      align-items: center
      gap: 0.3em
      color: var(--form-text-color)
      text-decoration: none
      border-radius: var(--border-radius)
      aspect-ratio: 1 / 1
      text-align: center
      background-color: var(--light-background-color)
      cursor: pointer
      border-bottom: 2px solid transparent
      position: relative

      &:hover
        background-color: var(--primary)
        color: var(--black)

      &--active
        background-color: var(--primary)
        color: var(--black)

      &--invalid
        background-color: var(--danger) !important
        color: var(--white) !important

      &--draggable
        cursor: grab

        &:active
          cursor: grabbing

      &--word
        border-color: v-bind('taskTypeColors["word"]')

      &--text
        border-color: v-bind('taskTypeColors["text"]')

      &--essay
        border-color: v-bind('taskTypeColors["essay"]')

      &--final-essay
        border-color: v-bind('taskTypeColors["final-essay"]')

      &--dictation
        border-color: v-bind('taskTypeColors["dictation"]')

      &__new-label
        position: absolute
        top: -3px
        right: -3px

      &__number
        font-size: 0.875rem
        font-weight: 500
        line-height: 0.8
</style>
