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
            no-margin
          >
            {{ pollEditStore.poll.description || 'Нет описания' }}
          </noo-text-block>
          <noo-textarea
            v-else
            v-model="pollEditStore.poll.description"
            label="Описание опроса"
          />

          <noo-text-block
            v-if="isReadonlyMode"
            dimmed
          >
            {{
              pollEditStore.poll.isAuthRequired
                ? 'Требуется авторизация'
                : 'Авторизация не требуется'
            }}
            <br />
            <noo-active-tag :active="pollEditStore.poll.isActive" />
            <br />Дата истечения:
            <noo-date
              :value="pollEditStore.poll.expiresAt"
              include-time
              timezones="both"
            />
          </noo-text-block>
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
                type="datetime-local"
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
          <noo-legend
            v-if="questionTypeLegend.length"
            class="polls-edit-page__question-count__legend"
            :items="questionTypeLegend"
          />
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
        <div
          v-if="!pollEditStore.poll.questions.length"
          class="polls-edit-page__content__empty"
        >
          <noo-text-block
            dimmed
            align="center"
          >
            В этом опросе пока нет вопросов
          </noo-text-block>
          <noo-button
            v-if="!isReadonlyMode"
            variant="secondary"
            @click="pollEditStore.addQuestion()"
          >
            Добавить вопрос
          </noo-button>
        </div>
        <div
          v-else
          class="polls-edit-page__content"
        >
          <noo-draggable-list
            v-model="pollEditStore.poll.questions"
            item-key="_key"
            gap="1em"
            handle=".poll-question-card__head__handle"
            :disabled="isReadonlyMode"
            @reorder="pollEditStore.reorderQuestions()"
          >
            <template #default="{ item: question, index }">
              <poll-question-card
                :question="question"
                :index="index"
                :readonly="isReadonlyMode"
                @remove="pollEditStore.removeQuestion(question._key)"
              />
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
  <noo-unsaved-changes-modal
    v-model:is-open="isAsking"
    :can-save="canSave"
    @decide="decide"
  />
</template>

<script setup lang="ts">
import type { LegendItem } from '@/components/inputs/noo-legend.vue'
import { useUnsavedChangesGuard } from '@/core/composables/useUnsavedChangesGuard'
import { pluralize } from '@/core/utils/lang.utils'
import { computed } from 'vue'
import pollQuestionCard from '../components/poll-question-card.vue'
import { pollQuestionTypes } from '../constants'
import { usePollEditStore } from '../stores/poll-edit.store'

export interface PollsEditPageProps {
  pollId?: string
}

defineProps<PollsEditPageProps>()

const pollEditStore = usePollEditStore()

const isReadonlyMode = computed(() => pollEditStore.mode === 'view')

// Only the types actually used in this poll, so the legend explains the accent
// color of every question card and nothing more.
const questionTypeLegend = computed<LegendItem[]>(() =>
  pollQuestionTypes.filter((type) =>
    pollEditStore.poll?.questions.some(
      (question) => question.type === type.value
    )
  )
)

const { isAsking, canSave, decide, confirm } = useUnsavedChangesGuard({
  hasChanges: () => pollEditStore.hasChanges(),
  // A poll that was never created has nowhere to be saved to but a new page of
  // its own, which is no way to leave the one being left.
  canSave: () => pollEditStore.mode === 'edit',
  save: () => pollEditStore.save()
})

async function cancelEdit() {
  if (await confirm()) {
    pollEditStore.cancelEdit()
  }
}
</script>

<style lang="sass" scoped>
.polls-edit-page
  &__sidebar
    display: flex
    flex-direction: column
    gap: 1em

  &__question-count
    &__legend
      margin-top: 0.5em

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
    &__empty
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center
      gap: 1em
      min-height: 40vh

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
