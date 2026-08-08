<template>
  <div class="task-cards-quiz-view">
    <noo-swap-animation>
      <div
        v-if="quizStore.status === 'loading'"
        key="loading"
        class="task-cards-quiz-view__loading"
      >
        <noo-loader-icon contrast />
      </div>

      <noo-error-block
        v-else-if="quizStore.status === 'error'"
        key="error"
        with-image
        centered
        :try-again="quizStore.restart"
      >
        <noo-title :size="4">
          {{
            quizStore.error
              ? `${quizStore.error.name}: ${quizStore.error.description}`
              : 'Не удалось собрать карточки для квиза'
          }}
        </noo-title>
        <noo-button
          variant="secondary"
          :to="{ name: 'task-cards.list' }"
        >
          К сохранённым заданиям
        </noo-button>
      </noo-error-block>

      <quiz-result
        v-else-if="quizStore.status === 'finished'"
        key="result"
        :total="quizStore.cards.length"
        :correct-count="quizStore.correctCount"
        :is-removing="quizStore.isRemovingCorrect"
        @restart="quizStore.restart"
        @remove-correct="onRemoveCorrect"
      />

      <div
        v-else-if="quizStore.currentCard"
        key="run"
        class="task-cards-quiz-view__run"
      >
        <div class="task-cards-quiz-view__progress">
          <div class="task-cards-quiz-view__progress__label">
            <span>
              Карточка {{ quizStore.currentIndex + 1 }} из
              {{ quizStore.cards.length }}
            </span>
            <span class="task-cards-quiz-view__progress__label__score">
              Верно: {{ quizStore.correctCount }}
            </span>
          </div>
          <noo-progress-bar :value="progress" />
        </div>

        <!-- Cards are dealt: the answered one leaves to the left, the next one
             comes in from the right. -->
        <div class="task-cards-quiz-view__deck">
          <transition name="quiz-deal">
            <quiz-card
              :key="quizStore.currentCard.savedTask.id"
              :card="quizStore.currentCard"
              @update:answer="onAnswerUpdate"
              @submit="quizStore.submitAnswer"
            />
          </transition>
        </div>

        <noo-swap-animation>
          <div
            :key="turn"
            class="task-cards-quiz-view__actions"
          >
            <!-- One row, three shapes of turn: answer it, own up to it, move on. -->
            <template v-if="quizStore.currentCard.status === 'answered'">
              <noo-button @click="quizStore.next">
                {{ isLastCard ? 'Завершить' : 'Следующая карточка' }}
              </noo-button>
            </template>

            <template v-else-if="quizStore.currentCard.kind === 'checked'">
              <noo-button
                :is-loading="quizStore.isCheckingAnswer"
                :disabled="!quizStore.currentCard.answer.trim()"
                @click="quizStore.submitAnswer"
              >
                Проверить
              </noo-button>
            </template>

            <template v-else-if="quizStore.currentCard.status === 'revealed'">
              <noo-button @click="quizStore.markOutcome('correct')">
                Я ответил верно
              </noo-button>
              <noo-button
                variant="danger"
                @click="quizStore.markOutcome('incorrect')"
              >
                Я ошибся
              </noo-button>
            </template>

            <template v-else>
              <noo-button @click="quizStore.revealAnswer">
                Показать ответ
              </noo-button>
            </template>
          </div>
        </noo-swap-animation>
      </div>
    </noo-swap-animation>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import quizCard from '../components/quiz-card.vue'
import quizResult from '../components/quiz-result.vue'
import { DEFAULT_QUIZ_CARD_COUNT, MIN_QUIZ_CARD_COUNT } from '../constants'
import { useTaskCardsQuizStore } from '../stores/task-cards-quiz.store'

export interface TaskCardsQuizViewProps {
  subjectId: string | null
  count: number
}

const props = defineProps<TaskCardsQuizViewProps>()

const router = useRouter()
const quizStore = useTaskCardsQuizStore()

const isLastCard = computed(
  () => quizStore.currentIndex === quizStore.cards.length - 1
)

const progress = computed(() =>
  quizStore.cards.length
    ? Math.round((quizStore.currentIndex / quizStore.cards.length) * 100)
    : 0
)

/**
 * Which turn the card is on. Keying the action row by it swaps the buttons
 * whenever the turn changes, instead of letting them mutate in place.
 */
const turn = computed(() => {
  const card = quizStore.currentCard

  return card ? `${card.savedTask.id}:${card.status}` : 'none'
})

function onAnswerUpdate(answer: string) {
  if (quizStore.currentCard) {
    quizStore.currentCard.answer = answer
  }
}

async function onRemoveCorrect() {
  await quizStore.removeCorrectCards()

  router.push({ name: 'task-cards.list' })
}

watch(
  () => [props.subjectId, props.count],
  () => {
    quizStore.start({
      subjectId: props.subjectId,
      count: Math.max(
        props.count || DEFAULT_QUIZ_CARD_COUNT,
        MIN_QUIZ_CARD_COUNT
      )
    })
  },
  { immediate: true }
)

onUnmounted(() => quizStore.reset())
</script>

<style scoped lang="sass">
.task-cards-quiz-view
  &__run
    display: flex
    flex-direction: column
    gap: var(--space-2xs)

  // The outgoing card is taken out of flow while it leaves, so the incoming one
  // does not wait below it for the animation to finish.
  &__deck
    position: relative

  &__loading
    display: flex
    align-items: center
    justify-content: center
    padding: var(--space-2xl)
    font-size: 2.5rem

  &__progress
    display: flex
    flex-direction: column
    gap: var(--space-3xs)

    &__label
      display: flex
      align-items: baseline
      justify-content: space-between
      gap: var(--space-2xs)
      font-size: 0.8em
      color: var(--text-light)

      &__score
        font-weight: 700

  &__actions
    display: flex
    flex-wrap: wrap
    justify-content: center
    gap: var(--space-2xs)
    margin-top: var(--space-2xs)

.quiz-deal
  &-enter-active
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1)

  &-leave-active
    transition: opacity 0.2s ease, transform 0.2s ease
    position: absolute
    inset: 0

  &-enter-from
    opacity: 0
    transform: translateX(2.5rem) rotate(1.5deg)

  &-leave-to
    opacity: 0
    transform: translateX(-2.5rem) rotate(-1.5deg)

  +reduced-motion
    &-enter-active,
    &-leave-active
      transition-duration: 0.01ms

    &-enter-from,
    &-leave-to
      transform: none
</style>
