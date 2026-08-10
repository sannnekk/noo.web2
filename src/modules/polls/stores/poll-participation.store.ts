import type { ApiError } from '@/core/api/api.utils'
import { isApiError, isApiErrorOf } from '@/core/api/api.utils'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { debouncedWatch } from '@vueuse/core'
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
import { clearDraft, readDraft, saveDraft } from '../participation.storage'
import {
  createEmptyAnswer,
  isAnswered,
  matchesQuestionType,
  toAnswerPayload,
  validateAnswer
} from '../participation.utils'
import type { PollAnswerInputValue, PollParticipant } from '../types'

/**
 * Long enough not to write on every keystroke, short enough that an accidental
 * reload lands after the answer it interrupted was already stored.
 */
const DRAFT_SAVE_DEBOUNCE_MS = 300

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
   * Whether the answers on screen were picked up from an earlier, unfinished
   * visit rather than typed in this one.
   */
  hasRestoredDraft: ShallowRef<boolean>
  /**
   * Throws the restored answers away and starts the poll from a blank slate.
   */
  discardDraft: () => void
  /**
   * Whether this user has already answered the poll and so cannot answer it
   * again.
   */
  hasParticipated: ComputedRef<boolean>
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
    const authStore = useAuthStore()

    const pollRequest = useApiRequest<string, PollEntity>((pollId) =>
      PollService.getById(pollId)
    )

    const answers = ref<Record<string, PollAnswerInputValue>>({})
    const participant = shallowRef<PollParticipant | null>(null)
    const isSubmitting = shallowRef(false)
    const isSubmitted = shallowRef(false)
    const hasRestoredDraft = shallowRef(false)
    // Errors stay hidden until the first submit attempt, see `errorsFor()`.
    const isValidationVisible = shallowRef(false)
    // Set when the API turned the answers away as a repeat participation.
    const isDuplicateRejected = shallowRef(false)
    // Guards the draft watcher: only answers the visitor gave are worth
    // storing, never the ones `init()` and `reset()` write themselves.
    const isDraftPersisted = shallowRef(false)

    const poll = pollRequest.data

    const questions = computed<PollQuestionEntity[]>(() =>
      [...(poll.value?.questions ?? [])].sort((a, b) => a.order - b.order)
    )

    const isExpired = computed(() => {
      const expiresAt = poll.value?.expiresAt

      return !!expiresAt && new Date(expiresAt).getTime() <= Date.now()
    })

    // The poll itself only knows about the visitor when they were already
    // signed in as it was loaded. Someone who signs in on the auth step is
    // recognized by the API on submit instead, and `isDuplicateRejected`
    // carries that answer back into the flow.
    const hasParticipated = computed(
      () => isDuplicateRejected.value || (poll.value?.hasParticipated ?? false)
    )

    const isAvailable = computed(
      () =>
        !!poll.value &&
        poll.value.isActive &&
        !isExpired.value &&
        !hasParticipated.value
    )

    const unavailabilityReason = computed<string | null>(() => {
      if (!poll.value || isAvailable.value) {
        return null
      }

      // The most specific reason wins: an expired poll the visitor already
      // answered is still a poll they answered.
      if (hasParticipated.value) {
        return 'Вы уже проходили этот опрос. Пройти его повторно нельзя'
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

    function createEmptyAnswers(): Record<string, PollAnswerInputValue> {
      return Object.fromEntries(
        questions.value.map((question) => [
          question.id,
          createEmptyAnswer(question)
        ])
      )
    }

    /**
     * Blank answers with whatever an earlier visit left behind laid over them.
     * The draft is filtered question by question: the poll may have been edited
     * since, and only values that still fit the question they belong to are
     * worth restoring.
     */
    function restoreAnswers(): Record<string, PollAnswerInputValue> {
      const restored = createEmptyAnswers()
      const draft = poll.value
        ? readDraft(poll.value.id, authStore.userId)
        : null

      if (!draft) {
        return restored
      }

      for (const question of questions.value) {
        const value = draft[question.id]

        if (!matchesQuestionType(question, value)) {
          continue
        }

        restored[question.id] = value

        if (isAnswered(question, value)) {
          hasRestoredDraft.value = true
        }
      }

      return restored
    }

    async function init(pollId: string): Promise<void> {
      reset()

      await pollRequest.execute(pollId)

      answers.value = restoreAnswers()
      isDraftPersisted.value = !!poll.value
    }

    function reset(): void {
      isDraftPersisted.value = false
      answers.value = {}
      participant.value = null
      isSubmitting.value = false
      isSubmitted.value = false
      isValidationVisible.value = false
      isDuplicateRejected.value = false
      hasRestoredDraft.value = false
    }

    function discardDraft(): void {
      if (poll.value) {
        clearDraft(poll.value.id, authStore.userId)
      }

      answers.value = createEmptyAnswers()
      hasRestoredDraft.value = false
      isValidationVisible.value = false
    }

    // The draft is what makes an accidental reload survivable, so it follows
    // the answers rather than any explicit "save" of the visitor's.
    debouncedWatch(
      answers,
      () => {
        if (!isDraftPersisted.value || !poll.value) {
          return
        }

        saveDraft(poll.value.id, answers.value, authStore.userId)
      },
      { debounce: DRAFT_SAVE_DEBOUNCE_MS, deep: true }
    )

    function setParticipant(value: PollParticipant | null): void {
      participant.value = value
    }

    async function submit(): Promise<boolean> {
      const currentPoll = poll.value
      const currentParticipant = participant.value

      if (
        !currentPoll ||
        !currentParticipant ||
        isSubmitting.value ||
        !isAvailable.value
      ) {
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
        // The visitor turns out to have answered this poll before — the
        // answers on screen can never be sent, so the flow stops here rather
        // than inviting another attempt.
        if (isApiErrorOf(response, 'USER_ALREADY_VOTED')) {
          isDuplicateRejected.value = true
          isDraftPersisted.value = false
          clearDraft(currentPoll.id, authStore.userId)
        }

        uiStore.createApiErrorToast(
          'Не удалось отправить ответы',
          response.error
        )

        return false
      }

      // Answered polls cannot be taken again, so the draft has nothing left to
      // protect.
      isDraftPersisted.value = false
      clearDraft(currentPoll.id, authStore.userId)
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
      hasRestoredDraft,
      discardDraft,
      hasParticipated,
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
