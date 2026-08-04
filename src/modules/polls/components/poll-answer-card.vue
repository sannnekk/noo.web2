<template>
  <div
    class="poll-answer-card"
    :class="{ 'poll-answer-card--invalid': errors.length > 0 }"
  >
    <div class="poll-answer-card__head">
      <span class="poll-answer-card__head__index">{{ index + 1 }}</span>
      <noo-title
        class="poll-answer-card__head__title"
        :size="4"
        no-margin
      >
        {{ question.title }}
      </noo-title>
      <span
        v-if="question.isRequired"
        class="poll-answer-card__head__required"
        title="Обязательный вопрос"
      >
        *
      </span>
    </div>

    <noo-text-block
      v-if="question.description"
      class="poll-answer-card__description"
      size="small"
      dimmed
      no-margin
    >
      {{ question.description }}
    </noo-text-block>

    <div class="poll-answer-card__input">
      <poll-answer-input
        v-model:value="model"
        :question="question"
      />
    </div>

    <noo-input-error-list
      class="poll-answer-card__errors"
      :errors="errors"
    />
  </div>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed } from 'vue'
import type { PollQuestionEntity } from '../api/poll.types'
import { pollQuestionTypes } from '../constants'
import type { PollAnswerInputValue } from '../types'
import pollAnswerInput from './poll-answer-input.vue'

interface Props {
  question: PollQuestionEntity
  index: number
  errors?: ValidationError[]
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => []
})

const model = defineModel<PollAnswerInputValue>('value', { required: true })

// Same accent the edit page gives the question type, so a poll looks like the
// one its author put together.
const typeColor = computed(
  () =>
    pollQuestionTypes.find((type) => type.value === props.question.type)
      ?.color ?? 'var(--text-light)'
)
</script>

<style scoped lang="sass">
.poll-answer-card
  background-color: var(--lightest)
  border-radius: var(--border-radius)
  border-left: 4px solid v-bind(typeColor)
  box-shadow: var(--block-shadow)
  padding: var(--space-s)

  &--invalid
    border-left-color: var(--danger)

  &__head
    display: flex
    align-items: baseline
    gap: 0.5em
    margin-bottom: 0.2em

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

    &__title
      flex-grow: 1

    &__required
      color: var(--danger)
      font-weight: 700
      cursor: help

  &__description
    margin-bottom: 0.5em

  &__input
    margin-top: 0.5em

  &__errors
    margin-top: 0.3em
</style>
