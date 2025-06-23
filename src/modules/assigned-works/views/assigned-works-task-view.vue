<template>
  <div
    v-if="task"
    class="assigned-works-task-view"
  >
    <div class="assigned-works-task-view__task">
      <noo-title :size="3">
        Задание {{ task.order }}
      </noo-title>
      <noo-richtext-block :value="task.content" />
    </div>
    <div class="assigned-works-task-view__answer">
      <div
        v-if="isRichText"
        class="assigned-works-task-view__answer__richtext"
      >
        <noo-richtext-editor
          v-model="richTextAnswerModel"
          :placeholder="isAnswerReadonly ? 'Нет ответа' : 'Введите ваш ответ здесь...'"
          :readonly="isAnswerReadonly"
        />
      </div>
      <div
        v-else-if="isWord"
        class="assigned-works-task-view__answer__word"
      >
        <noo-text-input
          v-model="wordAnswerModel"
          label="Ваш ответ"
          :validators="[(value) => maxLength(value, 100)]"
          :readonly="isAnswerReadonly"
        />
        <noo-text-block
          dimmed
          size="small"
        >
          Это задание в формате нескольких символов. Здесь не требуется длинный ответ или загрузка файла. Регистр и пробелы не влияют на проверку.
        </noo-text-block>
      </div>
    </div>
    <div class="assigned-works-task-view__score">
      <assigned-work-score
        v-model="answerScoreModel"
        :readonly="isScoreReadonly"
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
        :placeholder="isCommentReadonly ? 'Комментарий отсутствует' : 'Введите комментарий куратора здесь...'"
        :readonly="isCommentReadonly"
      />
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
    <noo-text-block dimmed>
      Задание не найдено
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { maxLength } from '@/core/validators/string.utils';
import { computed } from 'vue';
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store';
import type { AssignedWorkViewMode } from '../types';

export interface AssignedWorksTaskViewProps {
  taskId: string
  mode: AssignedWorkViewMode
}

const props = defineProps<AssignedWorksTaskViewProps>()

const assignedWorkDetailStore = useAssignedWorkDetailStore()

const task = computed(() => assignedWorkDetailStore.getTask(props.taskId))

const richTextAnswerModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].richTextContent,
  set: (value) => (assignedWorkDetailStore.answers[props.taskId].richTextContent = value)
})

const wordAnswerModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].wordContent,
  set: (value) => (assignedWorkDetailStore.answers[props.taskId].wordContent = value)
})

const mentorCommentModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].mentorComment,
  set: (value) => (assignedWorkDetailStore.answers[props.taskId].mentorComment = value)
})

const answerScoreModel = computed({
  get: () => assignedWorkDetailStore.answers[props.taskId].score,
  set: (value) => (assignedWorkDetailStore.answers[props.taskId].score = value)
})

const isRichText = computed(() =>
  task.value?.type === 'text' ||
  task.value?.type === 'essay' ||
  task.value?.type === 'final-essay'
)

const isWord = computed(() => task.value?.type === 'word')

const isAnswerReadonly = computed(() => {
  return props.mode !== 'solve'
})

const isScoreReadonly = computed(() => {
  return props.mode !== 'check'
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
