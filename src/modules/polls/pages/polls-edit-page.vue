<template>
  <div
    v-if="pollEditStore.poll"
    class="polls-edit-page"
  >
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="polls-edit-page__sidebar">
          <noo-title
            v-if="isReadonlyMode"
            :size="3"
          >
            {{ pollEditStore.poll.title }}
          </noo-title>
          <noo-text-input
            v-else
            v-model="pollEditStore.poll.title"
            label="Название опроса"
          />

          <noo-text-block
            v-if="isReadonlyMode"
            dimmed
          >
            {{ pollEditStore.poll.description || 'Нет описания' }}
          </noo-text-block>
          <noo-textarea
            v-else
            v-model="pollEditStore.poll.description"
            label="Описание опроса"
          />

          <template v-if="isReadonlyMode">
            <noo-text-block
              v-if="pollEditStore.poll.isAuthRequired"
              size="small"
              dimmed
            >
              ⚠ Требует авторизации
            </noo-text-block>
            <noo-text-block
              size="small"
              :color="pollEditStore.poll.isActive ? 'success' : undefined"
              :dimmed="!pollEditStore.poll.isActive"
            >
              {{ pollEditStore.poll.isActive ? 'Активен' : 'Неактивен' }}
            </noo-text-block>
            <noo-text-block
              v-if="pollEditStore.poll.isActive && pollEditStore.poll.expiresAt"
              dimmed
            >
              Истекает:
              <noo-date
                :value="pollEditStore.poll.expiresAt"
                include-time
              />
            </noo-text-block>
          </template>
          <template v-else>
            <noo-checkbox
              v-model="pollEditStore.poll.isAuthRequired"
              dimmed
              size="small"
            >
              Требовать авторизацию для прохождения опроса
            </noo-checkbox>

            <noo-checkbox
              v-model="pollEditStore.poll.isActive"
              dimmed
              size="small"
            >
              Опрос активен
            </noo-checkbox>
            <noo-if-animation>
              <noo-date-input
                v-if="pollEditStore.poll.isActive"
                v-model="pollEditStore.poll.expiresAt"
                label="Дата истечения опроса"
                resettable
              />
            </noo-if-animation>
          </template>
        </div>
        <div class="polls-edit-page__question-count">
          <noo-text-block
            dimmed
            size="small"
            align="center"
          >
            {{ pollEditStore.poll.questions.length }}
            {{
              pluralize(pollEditStore.poll.questions.length, [
                'вопрос',
                'вопроса',
                'вопросов'
              ])
            }}
          </noo-text-block>
        </div>
        <div class="polls-edit-page__actions">
          <noo-button
            v-if="isReadonlyMode"
            variant="primary"
            @click="pollEditStore.setMode('edit')"
          >
            Редактировать
          </noo-button>
          <template v-else>
            <noo-button
              variant="secondary"
              @click="pollEditStore.addQuestion()"
            >
              Добавить вопрос
            </noo-button>
            <noo-button
              variant="secondary"
              @click="cancelEdit()"
            >
              В режим просмотра
            </noo-button>
            <noo-button @click="pollEditStore.save()"> Сохранить </noo-button>
          </template>
        </div>
      </template>
      <template #content>
        <div class="polls-edit-page__content">
          <noo-draggable-list
            v-model="pollEditStore.poll.questions"
            item-key="_key"
            gap="1em"
            handle=".polls-edit-page__content__question__index"
            :disabled="isReadonlyMode"
          >
            <template #default="{ item: question, index }">
              <div class="polls-edit-page__content__question">
                <noo-grid-layout :cols="12">
                  <noo-grid-layout-item
                    :col="1"
                    :row="1"
                    horizontal-align="center"
                    vertical-align="center"
                  >
                    <span
                      class="polls-edit-page__content__question__index"
                      :class="{
                        'polls-edit-page__content__question__index--disabled':
                          isReadonlyMode
                      }"
                    >
                      {{ index + 1 }}.
                    </span>
                  </noo-grid-layout-item>
                  <noo-grid-layout-item
                    :col="2"
                    :row="1"
                    :colspan="5"
                    horizontal-align="stretch"
                  >
                    <noo-title
                      v-if="isReadonlyMode"
                      :size="4"
                    >
                      {{ question.title }}
                    </noo-title>
                    <noo-text-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Тип:
                      {{
                        questionTypes.find((t) => t.value === question.type)
                          ?.label
                      }}
                    </noo-text-block>
                    <noo-select-input
                      v-else
                      v-model="question.type"
                      label="Тип вопроса"
                      :options="questionTypes"
                    />
                  </noo-grid-layout-item>
                  <noo-grid-layout-item
                    :col="10"
                    :colspan="3"
                    :row="1"
                    horizontal-align="stretch"
                  >
                    <noo-text-block
                      v-if="isReadonlyMode"
                      size="small"
                      dimmed
                    >
                      {{
                        question.isRequired ? 'Обязательный' : 'Необязательный'
                      }}
                    </noo-text-block>
                    <noo-checkbox
                      v-else
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
                    <noo-text-block
                      v-if="isReadonlyMode"
                      dimmed
                    >
                      {{ question.description || 'Нет описания' }}
                    </noo-text-block>
                    <noo-textarea
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Мин. длина: {{ question.config.maxTextLength }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
                      v-model="question.config.minTextLength"
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
                    <noo-text-block v-if="isReadonlyMode">
                      Макс. длина: {{ question.config.maxTextLength }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Мин. значение: {{ question.config.minIntValue }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Макс. значение: {{ question.config.maxIntValue }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Мин. выбрать: {{ question.config.minChoices }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Макс. выбрать: {{ question.config.maxChoices }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <div v-if="isReadonlyMode">
                      <noo-text-block>Опции:</noo-text-block>
                      <ul style="margin: 0; padding-left: 1.2em">
                        <li
                          v-for="opt in question.config.options"
                          :key="opt"
                        >
                          {{ opt }}
                        </li>
                      </ul>
                    </div>
                    <noo-text-tag-input
                      v-else
                      v-model="question.config.options"
                      label="Опции (через Enter)"
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
                    <noo-text-block v-if="isReadonlyMode">
                      Мин. рейтинг: {{ question.config.minRating }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Макс. рейтинг: {{ question.config.maxRating }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Макс. размер:
                      {{ (question.config.maxFileSize || 0) / (1024 * 1024) }}
                      МБ
                    </noo-text-block>
                    <noo-select-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Макс. количество: {{ question.config.maxRating }}
                    </noo-text-block>
                    <noo-number-input
                      v-else
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
                    <noo-text-block v-if="isReadonlyMode">
                      Типы:
                      {{
                        question.config.allowedFileTypes
                          ?.map((t) => (t === 'image/jpeg' ? 'IMG' : 'DOC'))
                          .join(', ')
                      }}
                    </noo-text-block>
                    <noo-select-input
                      v-else
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
                      v-if="!isReadonlyMode"
                      variant="danger-inline"
                      @click="pollEditStore.removeQuestion(question._key)"
                    >
                      Удалить вопрос
                    </noo-button>
                  </noo-grid-layout-item>
                </noo-grid-layout>
              </div>
            </template>
          </noo-draggable-list>
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
  <noo-sure-modal
    v-model:is-open="sureChangeModeModalOpen"
    @confirm="confirmCancel()"
  >
    <template #title>
      <noo-title :size="3"> Вернуться в режим просмотра </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        У вас есть несохранённые изменения. Если вы вернётесь в режим просмотра,
        все несохранённые изменения будут потеряны.
      </noo-text-block>
    </template>
    <template #confirm-action-text> В режим просмотра </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import { pluralize } from '@/core/utils/lang.utils'
import { max } from '@/core/validators/string.utils'
import { computed, shallowRef } from 'vue'
import type { PollQuestionType } from '../api/poll.types'
import { usePollEditStore } from '../stores/poll-edit.store'

export interface PollsEditPageProps {
  pollId?: string
}

defineProps<PollsEditPageProps>()

const pollEditStore = usePollEditStore()
const sureChangeModeModalOpen = shallowRef(false)

const isReadonlyMode = computed(() => pollEditStore.mode === 'view')

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

function cancelEdit() {
  if (pollEditStore.hasChanges()) {
    sureChangeModeModalOpen.value = true
  } else {
    pollEditStore.cancelEdit()
  }
}

function confirmCancel() {
  pollEditStore.cancelEdit()
  sureChangeModeModalOpen.value = false
}
</script>

<style lang="sass" scoped>
.polls-edit-page
  &__view-mode
    &__header
      display: flex
      flex-direction: column
      align-items: center
      margin-bottom: 3em
      gap: 1em
      background-color: var(--lightest)
      padding: 2em
      border-radius: var(--border-radius)
      box-shadow: var(--block-shadow)

      &__meta
        display: flex
        align-items: center
        gap: 0.5em

        &__separator
          color: var(--text-light)
          font-size: 0.5em
          opacity: 0.5

    &__content
      display: flex
      flex-direction: column
      gap: 2em

    &__question
      background-color: var(--lightest)
      padding: 2em
      border-radius: var(--border-radius)
      box-shadow: var(--block-shadow)

      &__header
        display: grid
        grid-template-columns: auto 1fr auto
        gap: 1em
        align-items: flex-start
        margin-bottom: 1em

      &__index
        font-size: 2em
        font-weight: bold
        color: var(--primary-light)
        opacity: 0.3
        line-height: 1

      &__required
        color: var(--danger)
        font-size: 1.2em
        line-height: 0

      &__options
        margin-top: 1em
        display: flex
        flex-direction: column
        gap: 0.5em

      &__option
        display: flex
        align-items: center
        gap: 0.5em
        padding: 0.5em
        background-color: var(--light)
        border-radius: var(--border-radius)

        &__marker
          width: 1em
          height: 1em
          border: 2px solid var(--text-light)
          border-radius: 4px

          &--radio
            border-radius: 50%

      &__config
        display: flex
        gap: 1em
        margin-top: 0.5em

      &__files
        margin-top: 1em
        padding: 1em
        background-color: var(--light)
        border-radius: var(--border-radius)

        &__types
          display: flex
          gap: 0.5em
          margin-top: 0.5em

        &__type
          background-color: var(--white)
          padding: 0.2em 0.5em
          border-radius: 4px
          font-weight: bold

  &__view-mode
    padding: 0 10%

    &__header
      display: flex
      flex-direction: column
      align-items: center
      margin-bottom: 2em
      gap: 1em
      background-color: var(--lightest)
      padding: 2em
      border-radius: var(--border-radius)
      box-shadow: var(--block-shadow)

      &__meta
        display: flex
        align-items: center
        gap: 0.5em
        flex-wrap: wrap
        justify-content: center

        &__separator
          color: var(--text-light)
          font-size: 0.8em
          opacity: 0.5

      &__actions
        margin-top: 1em

    &__content
      display: flex
      flex-direction: column
      gap: 2em

    &__question
      background-color: var(--lightest)
      padding: 2em
      border-radius: var(--border-radius)
      box-shadow: var(--block-shadow)
      position: relative

      &__header
        display: grid
        grid-template-columns: auto 1fr auto
        gap: 1.5em
        align-items: flex-start
        margin-bottom: 1em

      &__index
        font-size: 2.5em
        font-weight: 900
        color: var(--primary)
        opacity: 0.1
        line-height: 1
        position: absolute
        left: 0.5em
        top: 0.2em

      &__title
        padding-top: 0.2em

      &__required
        color: var(--danger)
        font-size: 1em
        line-height: 1
        vertical-align: super
        margin-left: 0.2em

      &__details
        margin-left: 3.5em

      &__options
        margin-top: 1em
        display: flex
        flex-direction: column
        gap: 0.8em

      &__option
        display: flex
        align-items: center
        gap: 1em
        padding: 0.8em 1em
        background-color: var(--background)
        border-radius: var(--border-radius)
        border: 1px solid transparent

        &__marker
          width: 1.2em
          height: 1.2em
          border: 2px solid var(--text-light)
          border-radius: 4px
          flex-shrink: 0

          &--radio
            border-radius: 50%

      &__config
        display: flex
        gap: 1.5em
        margin-top: 1em
        padding: 1em
        background-color: var(--background)
        border-radius: var(--border-radius)
        flex-wrap: wrap

      &__files
        margin-top: 1em
        padding: 1em
        background-color: var(--background)
        border-radius: var(--border-radius)
        display: flex
        justify-content: space-between
        align-items: center

        &__types
          display: flex
          gap: 0.5em

        &__type
          background-color: var(--white)
          padding: 0.2em 0.6em
          border-radius: 4px
          font-weight: bold
          font-size: 0.8em
          border: 1px solid var(--border-color)

  &__sidebar
    display: flex
    flex-direction: column
    gap: 1em

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
      background-color: var(--light)
      border-radius: var(--border-radius)
      padding: 1em

      &__index
        display: inline-block
        font-weight: bold
        cursor: grab
        font-size: 1.5em

        &--disabled
          cursor: default

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
