import { isApiError } from '@/core/api/api.utils'
import { useViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import _ from 'lodash'
import {
  computed,
  ref,
  shallowRef,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type ShallowRef
} from 'vue'
import { PollService } from '../api/poll.service'
import type { PollAnswerEntity, PollQuestionEntity } from '../api/poll.types'
import {
  toAnswerInputValue,
  toAnswerPatch,
  validateAnswer
} from '../participation.utils'
import type { PollAnswerInputValue } from '../types'

interface UseParticipationAnswersEditorOptions {
  questions: MaybeRefOrGetter<PollQuestionEntity[]>
  /** The answers of the participation being edited, keyed by question id. */
  answers: MaybeRefOrGetter<Record<string, PollAnswerEntity>>
  /** Called once the corrected answers are stored, to pick them up again. */
  onSaved: () => Promise<void> | void
}

interface ParticipationAnswersEditor {
  isEditing: ComputedRef<boolean>
  isSaving: ShallowRef<boolean>
  /**
   * The answers as they are being edited, keyed by question id. Empty until
   * {@link ParticipationAnswersEditor.start} is called.
   */
  values: Ref<Record<string, PollAnswerInputValue>>
  /**
   * Whether the question's answer can be corrected. Answers are updated one by
   * one and in place, so a question the participant never got to see — one added
   * to the poll after they took it — has nothing to correct.
   */
  isEditable: (questionId: string) => boolean
  hasChanges: ComputedRef<boolean>
  /**
   * Validation errors of a single question. Empty until the first save attempt,
   * so nobody is told off for an answer they have not touched yet.
   */
  errorsFor: (questionId: string) => ValidationError[]
  start: () => void
  cancel: () => void
  /**
   * Stores every corrected answer, and reports whether they all went through.
   */
  save: () => Promise<boolean>
}

/**
 * Editing of the answers someone else gave, as staff correcting a participation
 * that was already submitted. The answers are patched one by one, each against
 * the question it belongs to, and re-read from the API afterwards.
 */
function useParticipationAnswersEditor(
  options: UseParticipationAnswersEditorOptions
): ParticipationAnswersEditor {
  const uiStore = useGlobalUIStore()

  const { mode, setMode } = useViewMode('view')

  const values = ref<Record<string, PollAnswerInputValue>>({})
  // What the answers looked like when editing started, to tell an edited answer
  // from one that was merely looked at.
  const originalValues = shallowRef<Record<string, PollAnswerInputValue>>({})
  const isSaving = shallowRef(false)
  const isValidationVisible = shallowRef(false)

  const isEditing = computed(() => mode.value === 'edit')

  const questions = computed(() => toValue(options.questions))
  const answers = computed(() => toValue(options.answers))

  function isEditable(questionId: string): boolean {
    return !!answers.value[questionId]
  }

  const editableQuestions = computed(() =>
    questions.value.filter((question) => isEditable(question.id))
  )

  const changedQuestions = computed(() =>
    editableQuestions.value.filter(
      (question) =>
        !_.isEqual(values.value[question.id], originalValues.value[question.id])
    )
  )

  const hasChanges = computed(() => changedQuestions.value.length > 0)

  const validationErrors = computed<Record<string, ValidationError[]>>(() =>
    Object.fromEntries(
      editableQuestions.value.map((question) => [
        question.id,
        validateAnswer(question, values.value[question.id] ?? null)
      ])
    )
  )

  function errorsFor(questionId: string): ValidationError[] {
    if (!isValidationVisible.value) {
      return []
    }

    return validationErrors.value[questionId] ?? []
  }

  function start(): void {
    values.value = Object.fromEntries(
      questions.value.map((question) => [
        question.id,
        toAnswerInputValue(question, answers.value[question.id])
      ])
    )
    originalValues.value = _.cloneDeep(values.value)
    isValidationVisible.value = false
    setMode('edit')
  }

  function cancel(): void {
    values.value = {}
    originalValues.value = {}
    isValidationVisible.value = false
    setMode('view')
  }

  async function save(): Promise<boolean> {
    if (isSaving.value) {
      return false
    }

    isValidationVisible.value = true

    if (Object.values(validationErrors.value).some((errors) => errors.length)) {
      uiStore.createWarningToast(
        'Проверьте ответы',
        'Некоторые вопросы заполнены неверно'
      )

      return false
    }

    const changed = changedQuestions.value

    if (!changed.length) {
      cancel()

      return true
    }

    isSaving.value = true

    for (const question of changed) {
      const response = await PollService.updateAnswer(
        answers.value[question.id].id,
        toAnswerPatch(question, values.value[question.id] ?? null)
      )

      if (isApiError(response)) {
        isSaving.value = false
        uiStore.createApiErrorToast(
          `Не удалось сохранить ответ на вопрос «${question.title}»`,
          response.error
        )

        // The answers before this one are already stored, so editing starts over
        // from what the server actually holds — the failed answer included.
        await options.onSaved()
        start()

        return false
      }
    }

    isSaving.value = false
    uiStore.createSuccessToast('Ответы сохранены')

    await options.onSaved()

    cancel()

    return true
  }

  return {
    isEditing,
    isSaving,
    values,
    isEditable,
    hasChanges,
    errorsFor,
    start,
    cancel,
    save
  }
}

export { useParticipationAnswersEditor, type ParticipationAnswersEditor }
