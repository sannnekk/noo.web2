<template>
  <div class="poll-answer-input">
    <noo-textarea
      v-if="question.type === 'text'"
      v-model="textValue"
      placeholder="Ваш ответ"
    />

    <noo-number-input
      v-else-if="question.type === 'number'"
      v-model="numberValue"
      label="Ваш ответ"
      :min="question.config.minIntValue ?? undefined"
      :max="question.config.maxIntValue ?? undefined"
      :step="1"
    />

    <noo-checkbox
      v-else-if="question.type === 'checkbox'"
      v-model="booleanValue"
    >
      Да
    </noo-checkbox>

    <noo-date-input
      v-else-if="question.type === 'date' || question.type === 'date-time'"
      v-model="dateValue"
      :type="question.type === 'date-time' ? 'datetime-local' : 'date'"
      placeholder="Выберите дату"
      resettable
    />

    <noo-select-input
      v-else-if="question.type === 'single-choice'"
      v-model="choiceValue"
      :options="singleChoiceOptions"
    />

    <noo-multi-select
      v-else-if="question.type === 'multiple-choice'"
      v-model="choicesValue"
      label="Выберите один или несколько вариантов"
      :options="options"
      :max-selections="question.config.maxChoices ?? options.length"
    />

    <poll-rating-input
      v-else-if="question.type === 'rating'"
      v-model="numberValue"
      :min="question.config.minRating"
      :max="question.config.maxRating"
    />

    <noo-warning-block
      v-else-if="question.type === 'files'"
      small
    >
      Ответы с файлами пока не поддерживаются. Опишите ответ в комментарии к
      опросу или свяжитесь с организатором.
    </noo-warning-block>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PollQuestionEntity } from '../api/poll.types'
import { toAnswerOptions } from '../participation.utils'
import type { PollAnswerInputValue } from '../types'
import pollRatingInput from './poll-rating-input.vue'

interface Props {
  question: PollQuestionEntity
}

const props = defineProps<Props>()

const model = defineModel<PollAnswerInputValue>('value', { required: true })

const options = computed(() => toAnswerOptions(props.question))

// A single-choice question needs an explicit "nothing picked" entry: the
// native select has no other way back to an empty answer.
const singleChoiceOptions = computed(() => [
  { label: 'Не выбрано', value: null },
  ...options.value
])

// The store keeps one loosely typed value per question; each input gets it
// narrowed to the type it works with, and writes straight back.
const textValue = computed<string | null>({
  get: () => (typeof model.value === 'string' ? model.value : null),
  set: (value) => (model.value = value)
})

const numberValue = computed<number | null>({
  get: () => (typeof model.value === 'number' ? model.value : null),
  set: (value) => (model.value = value ?? null)
})

const booleanValue = computed<boolean>({
  get: () => model.value === true,
  set: (value) => (model.value = value)
})

const dateValue = computed<Date | null>({
  get: () => (model.value instanceof Date ? model.value : null),
  set: (value) => (model.value = value ?? null)
})

const choiceValue = computed<string | null>({
  get: () => (typeof model.value === 'string' ? model.value : null),
  set: (value) => (model.value = value)
})

const choicesValue = computed<string[]>({
  get: () => (Array.isArray(model.value) ? model.value : []),
  set: (value) => (model.value = value)
})
</script>

<style scoped lang="sass">
.poll-answer-input
  // The inputs carry their own bottom margin for stacked forms; inside a
  // question card the card itself owns the spacing.
  :deep(.noo-input)
    margin-bottom: 0
</style>
