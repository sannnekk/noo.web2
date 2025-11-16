<template>
  <div
    v-if="pollEditStore.poll"
    class="polls-edit-page"
  >
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="polls-edit-page__input">
          <div class="polls-edit-page__sidebar">
            <noo-text-input
              v-model="pollEditStore.poll.title"
              label="Название опроса"
            />
          </div>
          <div class="polls-edit-page__sidebar">
            <noo-textarea
              v-model="pollEditStore.poll.description"
              label="Описание опроса"
            />
          </div>
          <div class="polls-edit-page__question-count">
            <noo-text-block
              dimmed
              size="small"
              align="center"
            >
              {{ pollEditStore.poll.questions.length }} вопрос(ов)
            </noo-text-block>
          </div>
          <div class="polls-edit-page__actions">
            <noo-button
              variant="secondary"
              @click="pollEditStore.addQuestion()"
            >
              Добавить вопрос
            </noo-button>
            <noo-button>Сохранить</noo-button>
          </div>
        </div>
      </template>
      <template #content>
        <div class="polls-edit-page__content">
          <noo-list-transition>
            <div
              v-for="(question, index) in pollEditStore.poll.questions"
              :key="question._key"
              class="polls-edit-page__content__question"
            >
              <noo-grid-layout :cols="12">
                <noo-grid-layout-item
                  :col="1"
                  :row="1"
                  horizontal-align="center"
                  vertical-align="center"
                >
                  <span class="polls-edit-page__content__question__index">
                    {{ index + 1 }}.
                  </span>
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  :col="2"
                  :row="1"
                  :colspan="5"
                  horizontal-align="stretch"
                >
                  <noo-text-input
                    v-model="question.title"
                    label="Вопрос"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  :col="7"
                  :colspan="3"
                  :row="1"
                  horizontal-align="stretch"
                >
                  <noo-select-input
                    v-model="question.type"
                    label="Тип вопроса"
                    :options="questionTypes"
                    :readonly="pollEditStore.mode === 'update'"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  :col="10"
                  :colspan="3"
                  :row="1"
                  horizontal-align="stretch"
                >
                  <noo-checkbox
                    v-model="question.isRequired"
                    dimmed
                    size="small"
                  >
                    Обязательный вопрос
                  </noo-checkbox>
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  :col="1"
                  :colspan="6"
                  :row="2"
                  :rowspan="2"
                  horizontal-align="stretch"
                  vertical-align="stretch"
                >
                  <noo-textarea
                    v-model="question.description"
                    label="Описание вопроса"
                  />
                </noo-grid-layout-item>

                <!-- question type text  -->
                <noo-grid-layout-item
                  v-if="question.type === 'text'"
                  :col="7"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.maxTextLength"
                    label="Мин. длина текста"
                    :min="0"
                    :max="1000"
                    :step="1"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="question.type === 'text'"
                  :col="10"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.maxTextLength"
                    label="Макс. длина текста"
                    :min="0"
                    :max="1000"
                    :step="1"
                  />
                </noo-grid-layout-item>

                <!-- question type number -->
                <noo-grid-layout-item
                  v-if="question.type === 'number'"
                  :col="7"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.minIntValue"
                    label="Мин. значение"
                    :min="0"
                    :max="1000"
                    :step="1"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="question.type === 'number'"
                  :col="10"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.maxIntValue"
                    label="Макс. значение"
                    :min="0"
                    :max="1000"
                    :step="1"
                  />
                </noo-grid-layout-item>

                <!-- question type multiple choice -->
                <noo-grid-layout-item
                  v-if="question.type === 'multiple-choice'"
                  :col="7"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.minChoices"
                    label="Минимум выбрать"
                    :min="0"
                    :max="100"
                    :step="1"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="question.type === 'multiple-choice'"
                  :col="10"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.maxChoices"
                    label="Максимум выбрать"
                    :min="0"
                    :max="100"
                    :step="1"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="
                    question.type === 'multiple-choice' ||
                    question.type === 'single-choice'
                  "
                  :col="7"
                  :colspan="6"
                  :row="3"
                  horizontal-align="stretch"
                >
                  <noo-tag-input
                    v-model="question.config.options"
                    label="Опции (через ентер)"
                    :min="0"
                    :max="100"
                  />
                </noo-grid-layout-item>

                <!-- question type rating -->
                <noo-grid-layout-item
                  v-if="question.type === 'rating'"
                  :col="7"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.minRating"
                    label="Мин. рейтинг"
                    :min="0"
                    :max="100"
                    :step="1"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="question.type === 'rating'"
                  :col="10"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.maxRating"
                    label="Макс. рейтинг"
                    :min="0"
                    :max="1000"
                    :step="1"
                  />
                </noo-grid-layout-item>

                <!-- question type files -->
                <noo-grid-layout-item
                  v-if="question.type === 'files'"
                  :col="7"
                  :colspan="3"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-select-input
                    v-model="question.config.maxFileSize!"
                    label="Макс. размер"
                    :options="[
                      { label: '1 МБ', value: 1 * 1024 * 1024 },
                      { label: '5 МБ', value: 5 * 1024 * 1024 },
                      { label: '10 МБ', value: 10 * 1024 * 1024 },
                      { label: '50 МБ', value: 50 * 1024 * 1024 }
                    ]"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="question.type === 'files'"
                  :col="7"
                  :colspan="3"
                  :row="3"
                  horizontal-align="stretch"
                >
                  <noo-number-input
                    v-model="question.config.maxRating"
                    label="Макс. количество"
                    :min="0"
                    :max="10"
                    :step="1"
                    :validators="[(value) => max(value, 10)]"
                  />
                </noo-grid-layout-item>
                <noo-grid-layout-item
                  v-if="question.type === 'files'"
                  :col="11"
                  :colspan="2"
                  :row="2"
                  horizontal-align="stretch"
                >
                  <noo-select-input
                    v-model="question.config.allowedFileTypes"
                    label="Тип файлов"
                    :options="[
                      {
                        label: 'Изображения',
                        value: ['image/jpeg', 'image/png']
                      },
                      { label: 'Документы', value: ['application/pdf'] }
                    ]"
                    multiple
                  />
                </noo-grid-layout-item>

                <noo-grid-layout-item
                  :col="1"
                  :colspan="12"
                  :row="4"
                  horizontal-align="right"
                >
                  <noo-button
                    variant="danger"
                    @click="pollEditStore.removeQuestion(question._key)"
                  >
                    Удалить вопрос
                  </noo-button>
                </noo-grid-layout-item>
              </noo-grid-layout>
            </div>
          </noo-list-transition>
        </div>
      </template>
    </noo-sidebar-layout>
  </div>
  <div
    v-else
    class="polls-edit-page__empty"
  >
    <noo-not-found-image />
    <noo-title :size="3"> Не удалось загрузить опрос </noo-title>
    <noo-text-block
      dimmed
      size="small"
    >
      Пожалуйста, попробуйте позже.
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { max } from '@/core/validators/string.utils'
import type { PollQuestionType } from '../api/poll.types'
import { usePollEditStore } from '../stores/poll-edit.store'

export interface PollsEditPageProps {
  pollId?: string
}

defineProps<PollsEditPageProps>()

const pollEditStore = usePollEditStore()

const questionTypes: { label: string; value: PollQuestionType }[] = [
  { label: 'Текст', value: 'text' },
  { label: 'Галочка', value: 'checkbox' },
  { label: 'Дата и время', value: 'date-time' },
  { label: 'Дата', value: 'date' },
  { label: 'Число', value: 'number' },
  { label: 'Один выбор', value: 'single-choice' },
  { label: 'Множественный выбор', value: 'multiple-choice' },
  { label: 'Файл', value: 'files' },
  { value: 'rating', label: 'Рейтинг' }
]
</script>

<style lang="sass" scoped>
.polls-edit-page
  &__actions
    display: flex
    flex-direction: column
    gap: 0.25em
    padding: 1em 0
    justify-content: center
    align-items: center

    > *
      width: 80%

  &__content
    &__question
      padding: 1em 0

      &:not(:last-child)
        border-bottom: 1px solid var(--border-color)

      &__index
        display: inline-block
        font-weight: bold
        font-size: 1.5em

  &__empty
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    min-height: 60vh
    width: 100%
    padding: 20px
</style>
