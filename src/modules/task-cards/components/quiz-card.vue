<template>
  <article
    class="quiz-card"
    :class="`quiz-card--${card.outcome ?? 'open'}`"
  >
    <header class="quiz-card__head">
      <noo-subject-block
        v-if="card.savedTask.work?.subject"
        :subject="card.savedTask.work.subject"
      />
      <span class="quiz-card__head__work">
        {{ card.savedTask.work?.title ?? 'Работа удалена' }}
      </span>
    </header>

    <div class="quiz-card__statement">
      <noo-richtext-block :value="card.savedTask.task.content" />
    </div>

    <div class="quiz-card__body">
      <!-- A word task has an answer key, so the student types and the server
           scores it. Everything else is theirs to judge. -->
      <template v-if="card.kind === 'checked'">
        <noo-text-input
          v-model="answerModel"
          label="Ваш ответ"
          :placeholder="isAnswered ? 'Нет ответа' : 'Введите ответ'"
          :readonly="isAnswered"
          @enter-press="emits('submit')"
        />
      </template>

      <div
        v-else-if="card.status !== 'unanswered'"
        class="quiz-card__answer"
      >
        <span class="quiz-card__answer__label">Ответ</span>
        <noo-richtext-block
          v-if="hasExplanation"
          :value="card.savedTask.task.explanation"
        />
        <noo-text-block
          v-else
          dimmed
          size="small"
          no-margin
        >
          У этого задания нет объяснения — сверьтесь со своей работой.
        </noo-text-block>
      </div>
    </div>

    <transition name="quiz-verdict">
      <footer
        v-if="verdict"
        class="quiz-card__verdict"
      >
        <noo-icon :name="verdict.icon" />
        <span>{{ verdict.label }}</span>
      </footer>
    </transition>
  </article>
</template>

<script setup lang="ts">
import type { IconName } from '@/components/icons/noo-icon.vue'
import { pluralize } from '@/core/utils/lang.utils'
import { richTextIsEmpty } from '@/core/utils/richtext.utils'
import { computed } from 'vue'
import type { QuizCard } from '../quiz.types'

interface Props {
  card: QuizCard
}

const props = defineProps<Props>()

const emits = defineEmits<{
  submit: []
  'update:answer': [answer: string]
}>()

const answerModel = computed<string>({
  get: () => props.card.answer,
  set: (answer) => emits('update:answer', answer)
})

const isAnswered = computed(() => props.card.status === 'answered')

const hasExplanation = computed(
  () => !richTextIsEmpty(props.card.savedTask.task.explanation)
)

const verdict = computed<{ icon: IconName; label: string } | null>(() => {
  if (props.card.outcome === null) {
    return null
  }

  if (props.card.outcome === 'incorrect') {
    return { icon: 'cross-red', label: 'Неверно' }
  }

  // A scored card can say what it was worth; a self-assessed one has no score
  // to report.
  const score = props.card.score

  return {
    icon: 'check-green',
    label:
      score === null
        ? 'Верно'
        : `Верно · ${score} ${pluralize(score, ['балл', 'балла', 'баллов'])}`
  }
})
</script>

<style scoped lang="sass">
.quiz-card
  display: flex
  flex-direction: column
  gap: var(--space-2xs)
  padding: var(--space-s)
  border-radius: var(--border-radius)
  background-color: var(--form-background)
  box-shadow: var(--block-shadow)
  border-left: 4px solid var(--card-accent, var(--secondary))
  transition: border-color 0.2s ease

  &--correct
    --card-accent: var(--success)

  &--incorrect
    --card-accent: var(--danger)

  &__head
    display: flex
    align-items: center
    gap: var(--space-2xs)
    flex-wrap: wrap

    &__work
      font-size: 0.75em
      color: var(--text-light)
      overflow-wrap: anywhere

  &__statement
    padding-top: var(--space-2xs)
    border-top: 1px solid var(--border-color)

  &__body
    display: flex
    flex-direction: column
    gap: var(--space-2xs)

  &__answer
    padding: var(--space-2xs)
    border-radius: var(--border-radius)
    background-color: var(--light-background-color)

    &__label
      display: block
      font-size: 0.7em
      font-weight: 700
      text-transform: uppercase
      letter-spacing: 0.05em
      color: var(--text-light)
      margin-bottom: 0.3em

  &__verdict
    display: flex
    align-items: center
    gap: 0.4em
    font-weight: 700
    font-size: 0.9em
    padding-top: var(--space-2xs)
    border-top: 1px solid var(--border-color)
    color: var(--card-accent)

// The verdict lands rather than fades: it is the answer to what the student
// just did, and the one moment on the card worth noticing.
.quiz-verdict
  &-enter-active
    transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.2, 1.4, 0.4, 1)

  &-enter-from
    opacity: 0
    transform: translateY(-0.5rem) scale(0.94)

  +reduced-motion
    &-enter-active
      transition-duration: 0.01ms

    &-enter-from
      transform: none
</style>
