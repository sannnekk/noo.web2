<template>
  <noo-scrollable-block
    class="task-grid"
    max-height="250px"
  >
    <div class="task-grid__inner">
      <router-link
        v-for="(item, index) in taskGrid"
        :key="index"
        :to="{
          name: 'assigned-works.detail.task',
          params: { taskId: item.taskId }
        }"
        class="task-grid__item"
        :class="{
          'task-grid__item--none': item.checkStatus === 'none',
          'task-grid__item--correct': item.checkStatus === 'correct',
          'task-grid__item--incorrect': item.checkStatus === 'incorrect',
          'task-grid__item--partially-correct':
            item.checkStatus === 'partially-correct',
          'task-grid__item--has-answer': item.hasAnswer,
          'task-grid__item--submitted': item.status === 'submitted'
        }"
      >
        <div
          v-if="icon(item)"
          class="task-grid__item__icon"
        >
          <noo-icon :name="icon(item)!" />
        </div>
        <span class="task-grid__item__number">
          {{ index + 1 }}
        </span>
      </router-link>
    </div>
  </noo-scrollable-block>
</template>

<script setup lang="ts">
import type { IconName } from '@/components/icons/noo-icon.vue'
import { computed } from 'vue'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import type { PossiblyUnsavedAnswer, TaskGrid } from '../types'
import { answerIsNotEmpty } from '../utils'

function icon(item: TaskGrid[number]): IconName | undefined {
  if (item.hasAnswer && item.status === 'not-submitted') {
    return 'check-green'
  }

  if (item.status === 'not-submitted') {
    return
  }

  // is submitted
  switch (item.checkStatus) {
    case 'correct':
      return 'check-green'
    case 'incorrect':
      return 'cross-red'
    case 'partially-correct':
      return 'attention-yellow'
    case 'none':
    default:
      return
  }
}

const assignedWorkDetailStore = useAssignedWorkDetailStore()

const taskGrid = computed(getTaskGrid)

/**
 * Gets the task grid for the assigned work.
 * This is used to navigate through the tasks in the assigned work.
 */
function getTaskGrid(): TaskGrid {
  const assignedWork = assignedWorkDetailStore.assignedWork
  const answers = assignedWorkDetailStore.answers

  if (!assignedWork?.work?.tasks?.length) {
    return []
  }

  const tasks = assignedWork.work.tasks
  const taskGrid: TaskGrid = []

  for (const task of tasks) {
    const answer = answers[task.id]

    taskGrid.push({
      hasAnswer: answerIsNotEmpty(task, answer),
      taskId: task.id,
      status: answer.status,
      checkStatus: getAnswerCheckStatus(answer)
    })
  }

  return taskGrid
}

/**
 * Gets the check status of the answer.
 *
 * @param answer The answer to get the check status for.
 * @returns The check status of the answer.
 */
function getAnswerCheckStatus(
  answer: PossiblyUnsavedAnswer
): 'none' | 'correct' | 'incorrect' | 'partially-correct' {
  if (typeof answer.score !== 'number' || typeof answer.maxScore !== 'number') {
    return 'none'
  }

  return answer.score === answer.maxScore
    ? 'correct'
    : answer.score > 0
      ? 'partially-correct'
      : 'incorrect'
}
</script>

<style scoped lang="sass">
.task-grid
  &__inner
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

    &:hover
      background-color: var(--primary)
      color: var(--black)

    &.router-link-exact-active,
    &.router-link-active
      background-color: var(--primary)
      color: var(--black)

    &__icon
      line-height: 0.7

    &__number
      font-size: 0.875rem
      font-weight: 500
      line-height: 0.8
</style>
