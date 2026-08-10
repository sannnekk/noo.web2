<template>
  <div
    class="poll-answer-result-card"
    :class="{ 'poll-answer-result-card--unanswered': !answer }"
  >
    <div class="poll-answer-result-card__head">
      <span class="poll-answer-result-card__head__index">{{ index + 1 }}</span>
      <div class="poll-answer-result-card__head__text">
        <noo-title
          :size="5"
          no-margin
        >
          {{ question.title }}
        </noo-title>
        <noo-text-block
          v-if="question.description"
          class="poll-answer-result-card__head__text__description"
          size="small"
          dimmed
          no-margin
        >
          {{ question.description }}
        </noo-text-block>
      </div>
    </div>

    <div class="poll-answer-result-card__answer">
      <poll-answer-value
        v-if="answer"
        :answer="answer"
      />
      <noo-text-block
        v-else
        dimmed
        no-margin
      >
        {{
          question.isRequired ? 'Обязательный вопрос без ответа' : 'Без ответа'
        }}
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PollAnswerEntity, PollQuestionEntity } from '../api/poll.types'
import pollAnswerValue from '../views/poll-answer-value.vue'

interface Props {
  question: PollQuestionEntity
  index: number
  answer?: PollAnswerEntity
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.poll-answer-result-card
  background-color: var(--lightest)
  border-radius: var(--border-radius)
  border-left: 4px solid var(--primary)
  box-shadow: var(--block-shadow)
  padding: var(--space-s)

  &--unanswered
    border-left-color: var(--border-color)

  &__head
    display: flex
    align-items: flex-start
    gap: var(--space-2xs)

    &__index
      display: flex
      align-items: center
      justify-content: center
      min-width: 1.8em
      height: 1.8em
      padding: 0 0.4em
      border-radius: var(--border-radius)
      background-color: var(--primary)
      color: var(--black)
      font-weight: 700
      font-size: 0.9em
      flex-shrink: 0

    &__text
      flex-grow: 1
      min-width: 0

      &__description
        margin-top: 0.2em

    &__type
      display: inline-flex
      align-items: center
      gap: 0.35em
      flex-shrink: 0
      font-size: var(--step--2)
      color: var(--text-light)
      white-space: nowrap
      cursor: help

      +mobile
        display: none

  &__answer
    margin-top: var(--space-2xs)
    // Aligned with the question title rather than the index badge, so the eye
    // runs straight down the answers.
    padding-left: calc(1.8em + var(--space-2xs))
    +mobile
      padding-left: 0
</style>
