<template>
  <task-card
    class="task-statement-block"
    title="Задание"
    accent="var(--secondary)"
    :badge="task.order"
  >
    <template #meta>
      <span class="task-statement-block__max-score">
        Макс.
        {{ task.maxScore }}
        {{ pluralize(task.maxScore, ['балл', 'балла', 'баллов']) }}
      </span>
      <slot name="actions" />
    </template>

    <noo-richtext-block :value="task.content" />
  </task-card>
</template>

<script setup lang="ts">
import { pluralize } from '@/core/utils/lang.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import taskCard from './task-card.vue'

interface Props {
  task: WorkTaskEntity
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.task-statement-block
  &__max-score
    font-size: 0.75em
    font-weight: 700
    white-space: nowrap
    padding: 0.15em 0.5em
    border-radius: var(--border-radius)
    background-color: var(--light-background-color)
    color: var(--text-light)
</style>
