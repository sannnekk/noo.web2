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
          v-if="resolveTaskGridIcon(item)"
          class="task-grid__item__icon"
        >
          <noo-icon :name="resolveTaskGridIcon(item)!" />
        </div>
        <span class="task-grid__item__number">
          {{ index + 1 }}
        </span>
      </router-link>
    </div>
  </noo-scrollable-block>
</template>

<script setup lang="ts">
import { useHotkeys } from '@/core/composables/useHotkeys'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import {
  resolveAnswerCheckStatus,
  resolveTaskGridIcon
} from '../task-grid.utils'
import type { TaskGrid } from '../types'
import { answerIsNotEmpty } from '../utils'

const assignedWorkDetailStore = useAssignedWorkDetailStore()

const taskGrid = computed(getTaskGrid)

const route = useRoute()
const router = useRouter()

// The grid is the order the tasks are in, so stepping through it is what moving
// between them means. Which one is open is read off the address rather than kept
// again here, so the shortcuts and the links above cannot disagree.
const currentIndex = computed(() =>
  taskGrid.value.findIndex((item) => item.taskId === route.params.taskId)
)

function taskIdAt(offset: number): string | undefined {
  if (currentIndex.value === -1) {
    return undefined
  }

  return taskGrid.value[currentIndex.value + offset]?.taskId
}

function goToTask(offset: number): void {
  const taskId = taskIdAt(offset)

  if (!taskId) {
    return
  }

  router.push({
    name: 'assigned-works.detail.task',
    params: { taskId }
  })
}

// No `allowInEditable`: the arrows belong to the answer being written whenever
// the caret is in it.
useHotkeys(() => [
  {
    combo: 'mod+ArrowRight',
    description: 'Следующее задание',
    when: () => !!taskIdAt(1),
    handler: () => goToTask(1)
  },
  {
    combo: 'mod+ArrowLeft',
    description: 'Предыдущее задание',
    when: () => !!taskIdAt(-1),
    handler: () => goToTask(-1)
  }
])

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
      checkStatus: resolveAnswerCheckStatus(answer)
    })
  }

  return taskGrid
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

    // Six columns stay six columns on a phone, so every cell is much narrower —
    // its contents step down to keep the number and its icon side by side.
    +mobile
      gap: 0.2em

      &__icon
        font-size: 0.8em

      &__number
        font-size: 0.75rem
</style>
