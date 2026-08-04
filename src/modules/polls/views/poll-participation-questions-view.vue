<template>
  <div class="poll-participation-questions-view">
    <div class="poll-participation-questions-view__progress">
      <noo-text-block
        size="small"
        dimmed
        no-margin
      >
        Отвечено {{ participationStore.answeredCount }} из
        {{ participationStore.questions.length }}
      </noo-text-block>
      <noo-progress-bar :value="participationStore.progress" />
    </div>

    <div
      v-if="participationStore.questions.length > 0"
      class="poll-participation-questions-view__list"
    >
      <poll-answer-card
        v-for="(question, index) in participationStore.questions"
        :key="question.id"
        v-model:value="participationStore.answers[question.id]"
        :question="question"
        :index="index"
        :errors="participationStore.errorsFor(question.id)"
      />
    </div>
    <noo-text-block
      v-else
      dimmed
      align="center"
    >
      В этом опросе пока нет вопросов
    </noo-text-block>

    <div class="poll-participation-questions-view__actions">
      <noo-button
        variant="secondary"
        :disabled="participationStore.isSubmitting"
        @click="goBack()"
      >
        Назад
      </noo-button>
      <noo-button
        variant="primary"
        :is-loading="participationStore.isSubmitting"
        :disabled="participationStore.questions.length === 0"
        @click="submit()"
      >
        Отправить ответы
      </noo-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePollParticipationStore } from '../stores/poll-participation.store'
import pollAnswerCard from '../components/poll-answer-card.vue'

const router = useRouter()
const participationStore = usePollParticipationStore()

function goBack(): void {
  router.push({
    name: 'polls.participate.auth',
    params: { pollId: participationStore.poll?.id }
  })
}

async function submit(): Promise<void> {
  const isSubmitted = await participationStore.submit()

  if (!isSubmitted) {
    return
  }

  router.push({
    name: 'polls.participate.success',
    params: { pollId: participationStore.poll?.id }
  })
}
</script>

<style lang="sass" scoped>
.poll-participation-questions-view
  &__progress
    display: flex
    flex-direction: column
    gap: var(--space-3xs)
    margin-bottom: var(--space-s)

  &__list
    display: flex
    flex-direction: column
    gap: var(--space-2xs)

  &__actions
    display: flex
    align-items: center
    justify-content: space-between
    gap: var(--space-2xs)
    margin-top: var(--space-m)

    +mobile
      flex-direction: column-reverse

      // Stacked, the primary action should still read as the wide one.
      > *
        width: 100%
</style>
