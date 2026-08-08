<template>
  <div class="task-cards-quiz-page">
    <task-cards-quiz-view
      :subject-id="subjectId"
      :count="count"
    />
  </div>
</template>

<script setup lang="ts">
import taskCardsQuizView from '../views/task-cards-quiz-view.vue'

export interface TaskCardsQuizPageProps {
  subjectId: string | null
  count: number
}

defineProps<TaskCardsQuizPageProps>()
</script>
