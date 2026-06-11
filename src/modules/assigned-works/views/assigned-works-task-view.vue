<template>
  <div
    v-if="task"
    class="assigned-works-task-view"
  >
    <div class="assigned-works-task-view__task">
      <noo-title :size="3"> Задание {{ task.order }} </noo-title>
      <noo-richtext-block :value="task.content" />
    </div>
    <div class="assigned-works-task-view__answer">
      <word-task-container
        v-if="taskType === 'word'"
        v-model="wordAnswerModel"
        :readonly="isAnswerReadonly"
      />
      <text-task-container
        v-else-if="taskType === 'text'"
        v-model="richTextAnswerModel"
        :readonly="isAnswerReadonly"
      />
      <!-- These types require also detailedScore, word counter and complex comments -->
      <essay-task-container
        v-else-if="taskType === 'essay'"
        v-model="richTextAnswerModel"
        :readonly="isAnswerReadonly"
      />
      <final-essay-task-container
        v-else-if="taskType === 'final-essay'"
        v-model="richTextAnswerModel"
        :readonly="isAnswerReadonly"
      />
      <dictation-task-container
        v-else-if="taskType === 'dictation'"
        v-model="richTextAnswerModel"
        :readonly="isAnswerReadonly"
      />
    </div>
    <div
      v-if="isScoreVisible"
      class="assigned-works-task-view__score"
    >
      <noo-number-input
        v-if="!isScoreReadonly"
        v-model="answerScoreModel"
        label="Оценка"
        :min="0"
        :max="task?.maxScore"
      />
      <noo-assigned-work-score
        v-else
        :score="answerScoreModel"
        :max-score="task?.maxScore ?? 0"
      />
    </div>
    <div
      v-if="task.solveHint"
      class="assigned-works-task-view__solve-hint"
    >
      <noo-title
        :size="4"
        class="assigned-works-task-view__title"
      >
        Подсказка
      </noo-title>
      <noo-richtext-block :value="task.solveHint" />
    </div>
    <div
      v-if="isMentorCommentVisible"
      class="assigned-works-task-view__comment"
    >
      <noo-title
        :size="4"
        class="assigned-works-task-view__title"
      >
        Комментарий куратора
      </noo-title>
      <noo-richtext-editor
        v-model="mentorCommentModel"
        :placeholder="
          isCommentReadonly
            ? 'Комментарий отсутствует'
            : 'Введите комментарий куратора здесь...'
        "
        :readonly="isCommentReadonly"
        media-category="assigned-work-mentor-rich-text"
      />
      <snippets-block v-if="!isCommentReadonly" />
    </div>
    <div class="assigned-works-task-view__detailed-score" />
    <div
      v-if="task.explanation && isExplanationVisible"
      class="assigned-works-task-view__explanation"
    >
      <noo-title
        :size="4"
        class="assigned-works-task-view__title"
      >
        Объяснение
      </noo-title>
      <noo-richtext-block :value="task.explanation" />
    </div>
  </div>
  <div
    v-else
    class="assigned-works-task-view__not-found"
  >
    <noo-text-block dimmed> Задание не найдено </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import snippetsBlock from '../components/snippets-block.vue'
import textTaskContainer from '../components/text-task-container.vue'
import wordTaskContainer from '../components/word-task-container.vue'
import essayTaskContainer from '../components/essay-task-container.vue'
import finalEssayTaskContainer from '../components/final-essay-task-container.vue'
import dictationTaskContainer from '../components/dictation-task-container.vue'
import { computed } from 'vue'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import type { AssignedWorkViewMode } from '../types'

export interface AssignedWorksTaskViewProps {
  taskId: string
  mode: AssignedWorkViewMode
}

const props = defineProps<AssignedWorksTaskViewProps>()

const assignedWorkDetailStore = useAssignedWorkDetailStore()

const task = computed(() => assignedWorkDetailStore.getTask(props.taskId))

const richTextAnswerModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].richTextContent,
  set: (value) =>
    assignedWorkDetailStore.updateAnswer(props.taskId, {
      richTextContent: value
    })
})

const wordAnswerModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].wordContent,
  set: (value) =>
    assignedWorkDetailStore.updateAnswer(props.taskId, { wordContent: value })
})

const mentorCommentModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].mentorComment,
  set: (value) =>
    assignedWorkDetailStore.updateAnswer(props.taskId, { mentorComment: value })
})

const answerScoreModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].score,
  set: (value) =>
    assignedWorkDetailStore.updateAnswer(props.taskId, { score: value })
})

const taskType = computed(() => task.value?.type)

const isAnswerReadonly = computed(() => {
  return props.mode !== 'solve'
})

const isScoreReadonly = computed(() => {
  return props.mode !== 'check'
})

const isScoreVisible = computed(() => {
  return props.mode != 'solve' && assignedWorkDetailStore.workIsSolved
})

const isCommentReadonly = computed(() => {
  return props.mode !== 'check'
})

const isExplanationVisible = computed(() => {
  return props.mode === 'check' || assignedWorkDetailStore.workIsSolved
})

const isMentorCommentVisible = computed(() => {
  return props.mode === 'check' || assignedWorkDetailStore.workIsSolved
})
</script>

<style scoped lang="sass">
.assigned-works-task-view
  &__task
    padding: 1em 0

  &__answer
    padding: 1em 0

  &__title
    margin-bottom: 0.5em
    margin-top: 2em
</style>
