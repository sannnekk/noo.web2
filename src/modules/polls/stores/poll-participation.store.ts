import type { ApiError } from '@/core/api/api.utils'
import { isApiError } from '@/core/api/api.utils'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { defineStore } from 'pinia'
import {
  computed,
  ref,
  shallowRef,
  type ComputedRef,
  type Ref,
  type ShallowRef
} from 'vue'
import { PollService } from '../api/poll.service'
import type { PollEntity, PollQuestionEntity } from '../api/poll.types'
import {
  createEmptyAnswer,
  isAnswered,
  toAnswerPayload,
  validateAnswer
} from '../participation.utils'
import type { PollAnswerInputValue, PollParticipant } from '../types'

interface PollParticipationStore {
  /**
   * The poll being taken. It can be null if it is not loaded (yet).
   */
  poll: ShallowRef<PollEntity | null>
  isLoading: ShallowRef<boolean>
  error: ShallowRef<ApiError | null>
  /**
   * The poll's questions in the order their author put them in.
   */
  questions: ComputedRef<PollQuestionEntity[]>
  /**
   * The current answers, keyed by question id.
   */
  answers: Ref<Record<string, PollAnswerInputValue>>
  /**
   * Who is answering. Set on the auth step, `null` until the visitor confirms
   * who they are — the questions step is off limits until then.
   */
  participant: ShallowRef<PollParticipant | null>
  isSubmitting: ShallowRef<boolean>
  isSubmitted: ShallowRef<boolean>
  /**
   * Whether the poll still accepts answers.
   */
  isAvailable: ComputedRef<boolean>
  /**
   * Why the poll cannot be taken, or `null` if it can.
   */
  unavailabilityReason: ComputedRef<string | null>
  answeredCount: ComputedRef<number>
  /**
   * Share of answered questions, 0 to 100.
   */
  progress: ComputedRef<number>
  isValid: ComputedRef<boolean>
  /**
   * Validation errors of a single question. Empty until the visitor has tried
   * to submit — nobody should be told off for a question they haven't reached.
   */
  errorsFor: (questionId: string) => ValidationError[]
  /**
   * Loads the poll and starts a fresh set of answers.
   */
  init: (pollId: string) => Promise<void>
  /**
   * Resets the store to its initial state, dropping the answers.
   */
  reset: () => void
  setParticipant: (value: PollParticipant | null) => void
  /**
   * Sends the answers. Returns whether they were accepted.
   */
  submit: () => Promise<boolean>
}

const usePollParticipationStore = defineStore(
  'polls:poll-participation',
  (): PollParticipationStore => {
    const uiStore = useGlobalUIStore()

    const pollRequest = useApiRequest<string, PollEntity>((pollId) =>
      PollService.getById(pollId)
    )

    const answers = ref<Record<string, PollAnswerInputValue>>({})
    const participant = shallowRef<PollParticipant | null>(null)
    const isSubmitting = shallowRef(false)
    const isSubmitted = shallowRef(false)
    // Errors stay hidden until the first submit attempt, see `errorsFor()`.
    const isValidationVisible = shallowRef(false)

    const poll = pollRequest.data

    const questions = computed<PollQuestionEntity[]>(() =>
      [...(poll.value?.questions ?? [])].sort((a, b) => a.order - b.order)
    )

    const isExpired = computed(() => {
      const expiresAt = poll.value?.expiresAt

      return !!expiresAt && new Date(expiresAt).getTime() <= Date.now()
    })

    const isAvailable = computed(
      () => !!poll.value && poll.value.isActive && !isExpired.value
    )

    const unavailabilityReason = computed<string | null>(() => {
      if (!poll.value || isAvailable.value) {
        return null
      }

      return isExpired.value
        ? 'Срок прохождения опроса истек'
        : 'Опрос больше не принимает ответы'
    })

    const answeredCount = computed(
      () =>
        questions.value.filter((question) =>
          isAnswered(question, answers.value[question.id] ?? null)
        ).length
    )

    const progress = computed(() => {
      if (questions.value.length === 0) {
        return 0
      }

      return Math.round((answeredCount.value / questions.value.length) * 100)
    })

    const validationErrors = computed<Record<string, ValidationError[]>>(() =>
      Object.fromEntries(
        questions.value.map((question) => [
          question.id,
          validateAnswer(question, answers.value[question.id] ?? null)
        ])
      )
    )

    const isValid = computed(() =>
      Object.values(validationErrors.value).every((errors) => !errors.length)
    )

    function errorsFor(questionId: string): ValidationError[] {
      if (!isValidationVisible.value) {
        return []
      }

      return validationErrors.value[questionId] ?? []
    }

    async function init(pollId: string): Promise<void> {
      reset()

      await pollRequest.execute(pollId)

      answers.value = Object.fromEntries(
        questions.value.map((question) => [
          question.id,
          createEmptyAnswer(question)
        ])
      )
    }

    function reset(): void {
      answers.value = {}
      participant.value = null
      isSubmitting.value = false
      isSubmitted.value = false
      isValidationVisible.value = false
    }

    function setParticipant(value: PollParticipant | null): void {
      participant.value = value
    }

    async function submit(): Promise<boolean> {
      const currentPoll = poll.value
      const currentParticipant = participant.value

      if (!currentPoll || !currentParticipant || isSubmitting.value) {
        return false
      }

      isValidationVisible.value = true

      if (!isValid.value) {
        uiStore.createWarningToast(
          'Проверьте ответы',
          'Некоторые вопросы заполнены неверно'
        )

        return false
      }

      isSubmitting.value = true

      const response = await PollService.participate(currentPoll.id, {
        userType: currentParticipant.userType,
        userExternalIdentifier: currentParticipant.externalIdentifier ?? null,
        userExternalData: currentParticipant.externalData ?? null,
        answers: questions.value.map((question) =>
          toAnswerPayload(question, answers.value[question.id] ?? null)
        )
      })

      isSubmitting.value = false

      if (isApiError(response)) {
        uiStore.createApiErrorToast(
          'Не удалось отправить ответы',
          response.error
        )

        return false
      }

      isSubmitted.value = true

      return true
    }

    return {
      poll,
      isLoading: pollRequest.isLoading,
      error: pollRequest.error,
      questions,
      answers,
      participant,
      isSubmitting,
      isSubmitted,
      isAvailable,
      unavailabilityReason,
      answeredCount,
      progress,
      isValid,
      errorsFor,
      init,
      reset,
      setParticipant,
      submit
    }
  }
)

export { usePollParticipationStore }
