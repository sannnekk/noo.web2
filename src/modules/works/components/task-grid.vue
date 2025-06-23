<template>
  <div class="task-grid">
    <noo-scrollable-block max-height="250px">
      <div class="task-grid__grid">
        <div
          v-for="task in tasks"
          :key="task._key"
          class="task-grid__grid__item"
          :class="{
            'task-grid__grid__item--active': task._key === activeTaskKey,
            'task-grid__grid__item--word': task.type === 'word',
            'task-grid__grid__item--text': task.type === 'text',
            'task-grid__grid__item--essay': task.type === 'essay',
            'task-grid__grid__item--final-essay': task.type === 'final-essay'
          }"
          @click="$emit('task-clicked', task)"
        >
          <noo-new-tag
            v-if="!task.id"
            class="task-grid__grid__item__new-label"
          />
          <span class="task-grid__grid__item__number">{{ task.order }}</span>
        </div>
      </div>
    </noo-scrollable-block>
    <div class="task-grid__legend">
      <div
        v-for="item in legend.filter((i) => i.if)"
        :key="item.color"
        class="task-grid__legend__item"
      >
        <noo-color-badge :color="item.color" />
        <noo-text-block
          dimmed
          size="small"
        >
          {{ item.text }}
        </noo-text-block>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PossiblyUnsavedWorkTask } from '../types'

interface LegendItem {
  color: string
  text: string
  if: boolean
}

interface Props {
  tasks: PossiblyUnsavedWorkTask[]
  activeTaskKey?: string
}

type Emits = (e: 'task-clicked', task: PossiblyUnsavedWorkTask) => void

const props = defineProps<Props>()

defineEmits<Emits>()

const legend = computed<LegendItem[]>(() => [
  {
    color: 'var(--danger)',
    text: 'В одну строку',
    if: props.tasks.some((task) => task.type === 'word')
  },
  {
    color: 'var(--lila)',
    text: 'Открытый вопрос',
    if: props.tasks.some((task) => task.type === 'text')
  },
  {
    color: 'var(--success)',
    text: 'Сочинение',
    if: props.tasks.some((task) => task.type === 'essay')
  },
  {
    color: 'var(--warning)',
    text: 'Итоговое сочинение',
    if: props.tasks.some((task) => task.type === 'final-essay')
  }
])
</script>

<style scoped lang="sass">
.task-grid
  &__grid
    display: grid
    grid-template-columns: repeat(6, 1fr)
    gap: 0.75em
    padding: 0.5em 0

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

      &--word
        border-color: var(--danger)

      &--text
        border-color: var(--lila)

      &--essay
        border-color: var(--success)

      &--final-essay
        border-color: var(--warning)

      &__new-label
        position: absolute
        top: -3px
        right: -3px

      &__number
        font-size: 0.875rem
        font-weight: 500
        line-height: 0.8

  &__legend
    display: flex
    flex-direction: column
    gap: 0.2em
    padding: 0.5em 0

    &__item
      white-space: nowrap

      .noo-text-block
        margin: 0
        display: inline-block !important
        padding-left: 0.5em
</style>
