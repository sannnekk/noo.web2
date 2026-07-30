<template>
  <div
    class="poll-question-card"
    :class="{ 'poll-question-card--readonly': readonly }"
  >
    <div class="poll-question-card__head">
      <div
        v-if="!readonly"
        class="poll-question-card__head__handle"
        title="Перетащите, чтобы изменить порядок"
      >
        <noo-icon name="drag-handle" />
      </div>
      <span class="poll-question-card__head__index">{{ index + 1 }}</span>
      <span
        v-if="questionModel.isRequired"
        class="poll-question-card__head__required"
      >
        Обязательный
      </span>
      <div class="poll-question-card__head__spacer" />
      <div
        v-if="!readonly"
        class="poll-question-card__head__remove"
        @click="$emit('remove')"
      >
        <noo-icon
          name="delete"
          hoverable
        />
        <span class="poll-question-card__head__remove__label">
          Удалить вопрос
        </span>
      </div>
    </div>

    <div class="poll-question-card__fields">
      <noo-text-input
        v-model="questionModel.title"
        label="Вопрос"
        :placeholder="readonly ? 'Без названия' : 'Текст вопроса'"
        :readonly="readonly"
      />
      <noo-select-input
        v-model="questionModel.type"
        label="Тип ответа"
        :options="pollQuestionTypes"
        :readonly="readonly"
      />
      <noo-textarea
        v-model="questionModel.description"
        class="poll-question-card__fields__description"
        label="Описание"
        :placeholder="readonly ? 'Нет описания' : 'Пояснение к вопросу'"
        :readonly="readonly"
      />
    </div>

    <noo-if-animation>
      <div
        v-if="hasAnswerSettings"
        class="poll-question-card__settings"
      >
        <noo-text-block
          class="poll-question-card__settings__legend"
          size="small"
          dimmed
          no-margin
        >
          Настройки ответа
        </noo-text-block>
        <div class="poll-question-card__settings__fields">
          <template v-if="questionModel.type === 'text'">
            <noo-number-input
              v-model="questionModel.config.minTextLength"
              label="Мин. длина текста"
              :min="0"
              :max="1000"
              :step="1"
              :readonly="readonly"
            />
            <noo-number-input
              v-model="questionModel.config.maxTextLength"
              label="Макс. длина текста"
              :min="0"
              :max="1000"
              :step="1"
              :readonly="readonly"
            />
          </template>

          <template v-if="questionModel.type === 'number'">
            <noo-number-input
              v-model="questionModel.config.minIntValue"
              label="Мин. значение"
              :min="0"
              :max="1000"
              :step="1"
              :readonly="readonly"
            />
            <noo-number-input
              v-model="questionModel.config.maxIntValue"
              label="Макс. значение"
              :min="0"
              :max="1000"
              :step="1"
              :readonly="readonly"
            />
          </template>

          <template v-if="questionModel.type === 'rating'">
            <noo-number-input
              v-model="questionModel.config.minRating"
              label="Мин. рейтинг"
              :min="0"
              :max="100"
              :step="1"
              :readonly="readonly"
            />
            <noo-number-input
              v-model="questionModel.config.maxRating"
              label="Макс. рейтинг"
              :min="0"
              :max="100"
              :step="1"
              :readonly="readonly"
            />
          </template>

          <template v-if="questionModel.type === 'multiple-choice'">
            <noo-number-input
              v-model="questionModel.config.minChoices"
              label="Минимум выбрать"
              :min="0"
              :max="100"
              :step="1"
              :readonly="readonly"
            />
            <noo-number-input
              v-model="questionModel.config.maxChoices"
              label="Максимум выбрать"
              :min="0"
              :max="100"
              :step="1"
              :readonly="readonly"
            />
          </template>

          <template v-if="questionModel.type === 'files'">
            <noo-select-input
              v-model="questionModel.config.maxFileSize!"
              label="Макс. размер файла"
              :options="pollFileSizeOptions"
              :readonly="readonly"
            />
            <noo-number-input
              v-model="questionModel.config.maxFileCount"
              label="Макс. количество файлов"
              :min="1"
              :max="10"
              :step="1"
              :readonly="readonly"
              :validators="[(value) => max(value, 10)]"
            />
            <noo-select-input
              v-model="fileTypeGroup"
              label="Тип файлов"
              :options="pollFileTypeGroups"
              :readonly="readonly"
            />
          </template>

          <noo-text-tag-input
            v-if="isChoiceQuestion"
            v-model="questionModel.config.options"
            class="poll-question-card__settings__fields--wide"
            label="Варианты ответа (добавляются по Enter)"
            :max="100"
            :readonly="readonly"
          />
        </div>
      </div>
    </noo-if-animation>

    <div
      v-if="!readonly"
      class="poll-question-card__footer"
    >
      <noo-checkbox
        v-model="questionModel.isRequired"
        dimmed
        size="small"
      >
        Обязательный вопрос
      </noo-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { max } from '@/core/validators/string.utils'
import { computed } from 'vue'
import type {
  PollQuestionType,
  PossiblyUnsavedQuestion
} from '../api/poll.types'
import {
  pollFileSizeOptions,
  pollFileTypeGroups,
  pollQuestionTypes
} from '../constants'
import type { PollFileTypeGroup } from '../types'

interface Props {
  index: number
  readonly?: boolean
}

type Emits = (e: 'remove') => void

defineProps<Props>()
defineEmits<Emits>()

const questionModel = defineModel<PossiblyUnsavedQuestion>('question', {
  required: true
})

/**
 * Question types that have anything to configure beyond the common fields.
 */
const typesWithAnswerSettings: PollQuestionType[] = [
  'text',
  'number',
  'rating',
  'single-choice',
  'multiple-choice',
  'files'
]

const isChoiceQuestion = computed(
  () =>
    questionModel.value.type === 'single-choice' ||
    questionModel.value.type === 'multiple-choice'
)

const hasAnswerSettings = computed(() =>
  typesWithAnswerSettings.includes(questionModel.value.type)
)

const typeColor = computed(
  () =>
    pollQuestionTypes.find((type) => type.value === questionModel.value.type)
      ?.color ?? 'var(--text-light)'
)

/**
 * The API stores plain MIME types while the form offers coarse groups, see
 * `pollFileTypeGroups`.
 */
const fileTypeGroup = computed<PollFileTypeGroup | null>({
  get: () =>
    pollFileTypeGroups.find((group) =>
      group.mimeTypes.some((mimeType) =>
        questionModel.value.config.allowedFileTypes?.includes(mimeType)
      )
    )?.value ?? null,
  set: (value) => {
    questionModel.value.config.allowedFileTypes =
      pollFileTypeGroups.find((group) => group.value === value)?.mimeTypes ??
      null
  }
})
</script>

<style scoped lang="sass">
.poll-question-card
  background-color: var(--lightest)
  border-radius: var(--border-radius)
  box-shadow: var(--block-shadow)
  border-left: 4px solid v-bind(typeColor)
  padding: var(--space-s)

  &--readonly
    box-shadow: none
    border: 1px solid var(--border-color)
    border-left: 4px solid v-bind(typeColor)

  &__head
    display: flex
    align-items: center
    gap: 0.5em
    margin-bottom: 0.5em

    &__handle
      cursor: grab
      display: flex
      align-items: center
      user-select: none
      --form-text-color: var(--text-light)

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

    &__required
      font-size: 0.75em
      font-weight: bold
      padding: 0.15em 0.5em
      border-radius: var(--border-radius)
      background-color: var(--light-background-color)
      color: var(--danger)
      white-space: nowrap

    &__spacer
      flex-grow: 1

    &__remove
      cursor: pointer
      display: flex
      align-items: center
      gap: 0.35em
      color: var(--danger)

      // Repaints the icon (it fills itself with `--danger`) and the label at once
      &:hover
        --danger: var(--dark-text-color)

      &__label
        font-size: 0.8em
        font-weight: 500
        white-space: nowrap

  &__fields
    display: grid
    grid-template-columns: 2fr 1fr
    gap: 0 var(--space-2xs)

    &__description
      grid-column: 1 / -1

    +mobile
      grid-template-columns: 1fr

  &__settings
    background-color: var(--light-background-color)
    border-radius: var(--border-radius)
    padding: var(--space-2xs) var(--space-xs)
    margin-top: 0.3em

    &__legend
      margin-bottom: 0.3em

    &__fields
      display: grid
      grid-template-columns: repeat(auto-fit, minmax(11em, 1fr))
      gap: 0 var(--space-2xs)

      &--wide
        grid-column: 1 / -1

  &__footer
    display: flex
    align-items: center
    justify-content: flex-end
    margin-top: 0.5em
</style>
