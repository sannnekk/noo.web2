import { isApiError, type ApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef, type ComputedRef, type Ref } from 'vue'
import { SavedTaskService } from '../api/saved-task.service'
import type { QuizDeckOptions } from '../api/saved-task.types'
import {
  resolveQuizCardKind,
  type QuizCard,
  type QuizCardOutcome,
  type QuizStatus
} from '../quiz.types'

interface TaskCardsQuizStore {
  cards: Ref<QuizCard[]>
  currentIndex: Ref<number>
  status: Ref<QuizStatus>
  error: Ref<ApiError | null>
  currentCard: ComputedRef<QuizCard | undefined>
  correctCount: ComputedRef<number>
  correctCards: ComputedRef<QuizCard[]>
  isCheckingAnswer: Ref<boolean>
  isRemovingCorrect: Ref<boolean>
  /** Draws a deck and starts a run. Replaces whatever run was in progress. */
  start: (options: QuizDeckOptions) => Promise<void>
  /** Draws a fresh deck with the options the current run was started with. */
  restart: () => Promise<void>
  /** Scores the typed answer of a `checked` card against its answer key. */
  submitAnswer: () => Promise<void>
  /** Shows the explanation of a `self-assessed` card. */
  revealAnswer: () => void
  /** Records how the student says they did on a `self-assessed` card. */
  markOutcome: (outcome: QuizCardOutcome) => void
  /** Moves to the next card, or finishes the run on the last one. */
  next: () => void
  /** Unsaves every card of this run the student got right. */
  removeCorrectCards: () => Promise<number>
  reset: () => void
}

const useTaskCardsQuizStore = defineStore(
  'task-cards:quiz',
  (): TaskCardsQuizStore => {
    const globalUiStore = useGlobalUIStore()

    const cards = ref<QuizCard[]>([])
    const currentIndex = ref(0)
    const status = ref<QuizStatus>('loading')
    const error = shallowRef<ApiError | null>(null)
    const isCheckingAnswer = ref(false)
    const isRemovingCorrect = ref(false)

    // Kept so "start again" deals a new deck on the same terms rather than
    // asking the student to set the quiz up a second time.
    const options = shallowRef<QuizDeckOptions | null>(null)

    const currentCard = computed<QuizCard | undefined>(
      () => cards.value[currentIndex.value]
    )

    const correctCards = computed(() =>
      cards.value.filter((card) => card.outcome === 'correct')
    )

    const correctCount = computed(() => correctCards.value.length)

    async function start(deckOptions: QuizDeckOptions): Promise<void> {
      options.value = deckOptions
      status.value = 'loading'
      error.value = null
      cards.value = []
      currentIndex.value = 0

      const response = await SavedTaskService.getQuizDeck(deckOptions)

      if (isApiError(response)) {
        error.value = response.error
        status.value = 'error'

        return
      }

      const deck = response.data ?? []

      if (!deck.length) {
        error.value = null
        status.value = 'error'

        return
      }

      cards.value = deck.map((savedTask) => ({
        savedTask,
        kind: resolveQuizCardKind(savedTask),
        status: 'unanswered',
        answer: '',
        outcome: null,
        score: null
      }))
      status.value = 'running'
    }

    async function restart(): Promise<void> {
      if (options.value) {
        await start(options.value)
      }
    }

    async function submitAnswer(): Promise<void> {
      const card = currentCard.value

      if (!card || card.kind !== 'checked' || card.status === 'answered') {
        return
      }

      isCheckingAnswer.value = true

      try {
        const response = await SavedTaskService.checkAnswer(
          card.savedTask.id,
          card.answer
        )

        if (isApiError(response)) {
          globalUiStore.createApiErrorToast(
            'Не удалось проверить ответ',
            response.error
          )

          return
        }

        if (!response.data) {
          return
        }

        card.score = response.data.score
        card.outcome = response.data.isCorrect ? 'correct' : 'incorrect'
        card.status = 'answered'
      } finally {
        isCheckingAnswer.value = false
      }
    }

    function revealAnswer(): void {
      const card = currentCard.value

      if (!card || card.kind !== 'self-assessed') {
        return
      }

      card.status = 'revealed'
    }

    function markOutcome(outcome: QuizCardOutcome): void {
      const card = currentCard.value

      if (!card || card.kind !== 'self-assessed') {
        return
      }

      card.outcome = outcome
      card.status = 'answered'
    }

    function next(): void {
      if (currentIndex.value >= cards.value.length - 1) {
        status.value = 'finished'

        return
      }

      currentIndex.value += 1
    }

    async function removeCorrectCards(): Promise<number> {
      const removed = correctCards.value

      if (!removed.length || isRemovingCorrect.value) {
        return 0
      }

      isRemovingCorrect.value = true

      try {
        const responses = await Promise.all(
          removed.map((card) => SavedTaskService.delete(card.savedTask.id))
        )

        const failed = responses.filter(isApiError)

        if (failed.length) {
          globalUiStore.createApiErrorToast(
            'Не удалось убрать часть карточек',
            failed[0].error
          )
        }

        const removedCount = responses.length - failed.length

        if (removedCount > 0) {
          globalUiStore.createSuccessToast(
            `Карточки убраны из сохранённых: ${removedCount}`
          )
        }

        return removedCount
      } finally {
        isRemovingCorrect.value = false
      }
    }

    function reset(): void {
      cards.value = []
      currentIndex.value = 0
      status.value = 'loading'
      error.value = null
      options.value = null
      isCheckingAnswer.value = false
      isRemovingCorrect.value = false
    }

    return {
      cards,
      currentIndex,
      status,
      error,
      currentCard,
      correctCount,
      correctCards,
      isCheckingAnswer,
      isRemovingCorrect,
      start,
      restart,
      submitAnswer,
      revealAnswer,
      markOutcome,
      next,
      removeCorrectCards,
      reset
    }
  }
)

export { useTaskCardsQuizStore, type TaskCardsQuizStore }
