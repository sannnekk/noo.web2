import type { ApiError } from '@/core/api/api.utils'
import { isApiError } from '@/core/api/api.utils'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useSaveStatus } from '@/core/composables/useSaveStatus'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { DateHelpers } from '@/core/utils/dates'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
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
import { useRouter } from 'vue-router'
import { AssignedWorkService } from '../api/assigned-work.service'
import type {
  AddHelperMentorOptions,
  AssignedWorkAnswerEntity,
  AssignedWorkEntity,
  AssignedWorkRemakeOptions
} from '../api/assigned-work.types'
import { useAnswerDrafts } from '../composables/useAnswerDrafts'
import { useCommentDraft } from '../composables/useCommentDraft'
import { AssignedWorkConfig } from '../config'
import type {
  AssignedWorkCommentSeat,
  AssignedWorkViewMode,
  PossiblyUnsavedAnswer,
  PossiblyUnsavedComment
} from '../types'
import { workIsChecked as isChecked, workIsSolved as isSolved } from '../utils'

/**
 * Debounce window (ms) after the last answer change before autosave runs.
 */
const AUTOSAVE_DEBOUNCE_MS = 1500

interface SaveOptions {
  /**
   * If true, suppress fullscreen loader and success toast.
   * Used by the autosave path so user keystrokes are not interrupted.
   */
  silent?: boolean
}

export interface AssignedWorkDetailStore {
  assignedWork: ShallowRef<AssignedWorkEntity | undefined>
  answers: Ref<Record<string, PossiblyUnsavedAnswer>>
  /**
   * The current user's own comment on the work as a whole, as they are writing
   * it. The other participants' comments are read off `assignedWork`.
   */
  ownComment: Ref<PossiblyUnsavedComment>
  ownCommentSeat: ComputedRef<AssignedWorkCommentSeat | null>
  canEditOwnComment: ComputedRef<boolean>
  commentOf: (seat: AssignedWorkCommentSeat) => IRichText | null
  updateComment: (content: IRichText | null) => void
  markSolved: UseApiRequestReturn
  markChecked: UseApiRequestReturn
  remake: UseApiRequestReturn<AssignedWorkRemakeOptions, { id: string }>
  shiftSolveDeadline: UseApiRequestReturn
  shiftCheckDeadline: UseApiRequestReturn
  markUnsolved: UseApiRequestReturn
  markUnchecked: UseApiRequestReturn
  addHelperMentor: UseApiRequestReturn<AddHelperMentorOptions>
  saveStatus: ReturnType<typeof useSaveStatus>
  /**
   * Whether any answer has been changed since it was last stored.
   */
  hasUnsavedChanges: ComputedRef<boolean>
  init: (assignedWorkId: string) => Promise<boolean>
  setMode: (mode: AssignedWorkViewMode) => void
  viewMode: Ref<AssignedWorkViewMode>
  save: (options?: SaveOptions) => Promise<boolean>
  isAutosaveEnabled: ComputedRef<boolean>
  getTask: (taskId: string) => WorkTaskEntity | undefined
  updateAnswer: (taskId: string, patch: Partial<PossiblyUnsavedAnswer>) => void
  totalScore: ComputedRef<number | null>
  workIsSolved: ComputedRef<boolean>
  workIsChecked: ComputedRef<boolean>
  workIsRemakeable: ComputedRef<boolean>
  allTasksAreSolved: ComputedRef<boolean>
  reset: () => void
}

const useAssignedWorkDetailStore = defineStore(
  'assigned-works:assigned-work-detail',
  (): AssignedWorkDetailStore => {
    const router = useRouter()
    const globalUiStore = useGlobalUIStore()

    /**
     * View mode
     */
    const viewMode = ref<AssignedWorkViewMode>('read')

    /**
     * The assigned work entity.
     */
    const assignedWork = shallowRef<AssignedWorkEntity>()

    /**
     * Bumped on every user edit. Watched (with debouncing) to trigger autosave.
     * The drafts themselves are deliberately NOT watched deeply: seeding them and
     * writing back saved ids would otherwise look like edits.
     */
    const autosaveTrigger = ref(0)

    function onDraftChange(): void {
      autosaveTrigger.value++
    }

    const answerDrafts = useAnswerDrafts(
      () => assignedWork.value,
      onDraftChange
    )
    const commentDraft = useCommentDraft(
      () => assignedWork.value,
      onDraftChange
    )

    /**
     * True if there are unsaved (user-modified) changes pending.
     * Pristine drafts (`_status === 'empty'`) are not considered dirty.
     */
    const hasUnsavedChanges = computed<boolean>(
      () => answerDrafts.hasChanges.value || commentDraft.hasChanges.value
    )

    /**
     * The assigned work save status.
     */
    const saveStatus = useSaveStatus()

    /**
     * Store init function.
     * Must be called before using the store in the beforeEnter hook of the route.
     *
     * @param assignedWorkId - The ID of the assigned work to load.
     */
    async function init(assignedWorkId: string): Promise<boolean> {
      // A work arrives with its tasks, answers and comments in one response, so
      // the wait is long enough to be worth narrating.
      const apiResponse = await globalUiStore.withLoader(
        'Загрузка работы...',
        (onProgress) => AssignedWorkService.getById(assignedWorkId, onProgress)
      )

      if (isApiError(apiResponse)) {
        globalUiStore.createApiErrorToast(
          'Не удалось загрузить работу',
          apiResponse.error
        )

        return false
      }

      if (!apiResponse.data) {
        return false
      }

      assignedWork.value = apiResponse.data
      answerDrafts.seed()
      commentDraft.seed()

      return true
    }

    /**
     * Set the view mode of the assigned work.
     * Also reflects the mode into the route param without reloading the page.
     */
    function setMode(mode: AssignedWorkViewMode): void {
      if (viewMode.value === mode) {
        return
      }

      viewMode.value = mode

      const currentRoute = router.currentRoute.value

      if (
        currentRoute.name &&
        currentRoute.params.assignedWorkId &&
        currentRoute.params.mode !== mode
      ) {
        router.replace({
          name: currentRoute.name,
          params: { ...currentRoute.params, mode },
          query: currentRoute.query,
          hash: currentRoute.hash
        })
      }
    }

    /**
     * Tracks an in-flight save promise so concurrent save invocations are
     * serialized (e.g. manual save during a pending autosave debounce).
     */
    let inFlightSave: Promise<boolean> | null = null

    /**
     * Saves the answers to the server, and reports whether they went through.
     *
     * Calls to `save` are serialized: if a save is already in flight, the new
     * call waits for it and then runs, ensuring later changes are not dropped
     * by a concurrent in-flight request.
     */
    async function save(options: SaveOptions = {}): Promise<boolean> {
      const previous = inFlightSave
      const next = previous
        ? previous.catch(() => undefined).then(() => doSave(options))
        : doSave(options)

      inFlightSave = next.finally(() => {
        if (inFlightSave === next) {
          inFlightSave = null
        }
      })

      return inFlightSave
    }

    /**
     * Actual save implementation. Do not call directly — go through `save`.
     */
    async function doSave({ silent = false }: SaveOptions): Promise<boolean> {
      if (!assignedWork.value) {
        return false
      }

      const changedAnswers = answerDrafts.changed.value
      const commentIsChanged = commentDraft.hasChanges.value

      if (changedAnswers.length === 0 && !commentIsChanged) {
        if (!silent) {
          globalUiStore.createSuccessToast('Работа сохранена')
        }

        return true
      }

      if (!silent) {
        globalUiStore.setLoading(true, undefined, 'Сохранение работы...')
      }

      saveStatus.beginSave()

      /**
       * Reports a failed save once, whatever it was that failed to go through.
       */
      function fail(error: ApiError): false {
        if (!silent) {
          globalUiStore.setLoading(false)
          globalUiStore.createApiErrorToast(
            'Не удалось сохранить работу',
            error
          )
        }
        saveStatus.endSave({ success: false })

        return false
      }

      const answerIdsByTaskId: Record<string, string> = {}

      for (const answer of changedAnswers as AssignedWorkAnswerEntity[]) {
        const response = await AssignedWorkService.saveAnswer(
          assignedWork.value.id,
          {
            id: answer.id,
            taskId: answer.taskId,
            status: answer.status,
            richTextContent: answer.richTextContent ?? undefined,
            wordContent: answer.wordContent,
            mentorComment: answer.mentorComment ?? undefined,
            score: answer.score,
            maxScore: answer.maxScore,
            detailedScore: answer.detailedScore
          }
        )

        if (isApiError(response)) {
          return fail(response.error)
        }

        if (response.data) {
          answerIdsByTaskId[answer.taskId] = response.data.id
        }
      }

      answerDrafts.markSaved(answerIdsByTaskId)

      if (commentIsChanged) {
        const response = await AssignedWorkService.saveComment(
          assignedWork.value.id,
          { content: commentDraft.draft.value.content }
        )

        if (isApiError(response)) {
          return fail(response.error)
        }

        commentDraft.markSaved(response.data?.id)
      }

      if (!silent) {
        globalUiStore.setLoading(false)
      }

      saveStatus.endSave({ success: true })

      return true
    }

    /**
     * Autosave is allowed only while the user is actively solving or checking
     * the work. Read mode is view-only and must never produce network writes.
     */
    const isAutosaveEnabled = computed<boolean>(
      () => viewMode.value === 'solve' || viewMode.value === 'check'
    )

    debouncedWatch(
      autosaveTrigger,
      () => {
        if (!isAutosaveEnabled.value) {
          return
        }

        if (!assignedWork.value) {
          return
        }

        if (!hasUnsavedChanges.value) {
          return
        }

        void save({ silent: true })
      },
      { debounce: AUTOSAVE_DEBOUNCE_MS }
    )

    /**
     * Marks the assigned work as solved.
     */
    const markSolved = useApiRequest(
      () => AssignedWorkService.markSolved(assignedWork.value!.id),
      () => {
        globalUiStore.createSuccessToast('Работа успешно сдана')
        router.push({
          name: 'assigned-works.detail',
          params: { assignedWorkId: assignedWork.value!.id, mode: 'read' }
        })
      },
      (error) => {
        globalUiStore.createApiErrorToast('Не удалось сдать работу', error)
      }
    )

    /**
     * Marks the assigned work as checked.
     */
    const markChecked = useApiRequest(
      () => AssignedWorkService.markChecked(assignedWork.value!.id),
      () => {
        globalUiStore.createSuccessToast('Работа успешно проверена')
      },
      (error) => {
        globalUiStore.createApiErrorToast('Не удалось проверить работу', error)
      }
    )

    /**
     * Remakes the assigned work.
     * This is used to remake the work
     */
    const remake = useApiRequest<AssignedWorkRemakeOptions, { id: string }>(
      (options) => AssignedWorkService.remake(assignedWork.value!.id, options),
      (response) => {
        const newAssignedWorkId = response.data.id

        globalUiStore.createSuccessToast('Новый экземпляр работы создан')

        router.push({
          name: 'assigned-works.detail',
          params: { assignedWorkId: newAssignedWorkId, mode: 'solve' }
        })
      },
      (error) => {
        globalUiStore.createApiErrorToast('Не удалось переделать работу', error)
      }
    )

    /**
     * Builds one of the two deadline shifts. They differ only in which date they
     * move, by how much, and what they say about it — everything else, including
     * the work having no deadline to move in the first place, is the same.
     *
     * @param carryCheckDeadlineBy Days to drag the check deadline along by, for
     *   the solve shift: giving a student longer to answer gives their mentor
     *   longer to check.
     */
    function useDeadlineShift(options: {
      field: 'solveDeadlineAt' | 'checkDeadlineAt'
      days: number
      successMessage: string
      failureMessage: string
      missingDeadlineMessage: string
      carryCheckDeadlineBy?: number
    }): UseApiRequestReturn {
      const shifted = () =>
        DateHelpers.addDays(assignedWork.value![options.field], options.days)

      return useApiRequest(
        () => {
          const newDeadline = shifted()

          if (!newDeadline) {
            return Promise.resolve({
              error: {
                id: 'INVALID_DEADLINE',
                statusCode: 0,
                name: 'Invalid deadline',
                description: options.missingDeadlineMessage,
                payload: null
              } as ApiError
            })
          }

          return AssignedWorkService.shiftDeadline(assignedWork.value!.id, {
            newDeadline,
            notifyOthers: true
          })
        },
        () => {
          globalUiStore.createSuccessToast(options.successMessage)

          // Replaced rather than written into: `assignedWork` is a shallowRef, so
          // a nested write moves the value without telling anything reading it.
          assignedWork.value = {
            ...assignedWork.value!,
            [options.field]: shifted(),
            ...(options.carryCheckDeadlineBy === undefined
              ? {}
              : {
                  checkDeadlineAt: DateHelpers.addDays(
                    assignedWork.value!.checkDeadlineAt,
                    options.carryCheckDeadlineBy
                  )
                })
          }
        },
        (error) => {
          globalUiStore.createApiErrorToast(options.failureMessage, error)
        }
      )
    }

    const shiftSolveDeadline = useDeadlineShift({
      field: 'solveDeadlineAt',
      days: AssignedWorkConfig.solveDeadlineShift,
      successMessage: 'Дедлайн успешно сдвинут',
      failureMessage: 'Не удалось сдвинуть дедлайн',
      missingDeadlineMessage:
        'Невозможно сдвинуть дедлайн: текущий дедлайн отсутствует',
      carryCheckDeadlineBy:
        AssignedWorkConfig.checkDeadlineShiftWhileSolveDeadlineShift
    })

    const shiftCheckDeadline = useDeadlineShift({
      field: 'checkDeadlineAt',
      days: AssignedWorkConfig.checkDeadlineShift,
      successMessage: 'Дедлайн проверки успешно сдвинут',
      failureMessage: 'Не удалось сдвинуть дедлайн проверки',
      missingDeadlineMessage:
        'Невозможно сдвинуть дедлайн проверки: текущий дедлайн отсутствует'
    })

    /**
     * Marks the assigned work as unsolved.
     */
    const markUnsolved = useApiRequest(
      () => AssignedWorkService.markUnsolved(assignedWork.value!.id),
      () => {
        globalUiStore.createSuccessToast('Работа вернулась на доработку')
        router.push({
          name: 'assigned-works.detail',
          params: { assignedWorkId: assignedWork.value!.id, mode: 'read' }
        })
      },
      (error) => {
        globalUiStore.createApiErrorToast(
          'Не удалось вернуть работу на доработку',
          error
        )
      }
    )

    /**
     * Marks the assigned work as unchecked.
     */
    const markUnchecked = useApiRequest(
      () => AssignedWorkService.markUnchecked(assignedWork.value!.id),
      () => {
        globalUiStore.createSuccessToast('Проверка работы отменена')
      },
      (error) => {
        globalUiStore.createApiErrorToast(
          'Не удалось отменить проверку работы',
          error
        )
      }
    )

    /**
     * Adds a helper mentor to the assigned work.
     */
    const addHelperMentor = useApiRequest<AddHelperMentorOptions>(
      (options) =>
        AssignedWorkService.addMentor(assignedWork.value!.id, options),
      () => {
        globalUiStore.createSuccessToast('Помощник успешно добавлен')
      },
      (error) => {
        globalUiStore.createApiErrorToast(
          'Не удалось добавить помощника',
          error
        )
      }
    )

    /**
     * Resets the assigned work and answers.
     * Must be called when the user navigates away from the page or when the assigned work is changed.
     * This is to prevent data leaks between different assigned works.
     */
    function reset(): void {
      assignedWork.value = undefined
      answerDrafts.reset()
      commentDraft.reset()
      saveStatus.reset()
      inFlightSave = null
    }

    /**
     * A comment is written in the same modes as the answers it accompanies: the
     * student writes theirs while solving, the mentors theirs while checking.
     */
    const canEditOwnComment = computed<boolean>(
      () => isAutosaveEnabled.value && commentDraft.seat.value !== null
    )

    /**
     * Gets the task by ID.
     */
    function getTask(taskId: string): WorkTaskEntity | undefined {
      return assignedWork.value?.work?.tasks?.find((task) => task.id === taskId)
    }

    /**
     * The work's score.
     *
     * While checking, it is the running sum of what the tasks have been given,
     * so the mentor sees the total move as they hand out points — the server
     * only recomputes its own figure when the work is submitted. Everywhere
     * else the server's figure is the one that counts.
     */
    const totalScore = computed<number | null>(() => {
      if (viewMode.value !== 'check') {
        return assignedWork.value?.score ?? null
      }

      return answerDrafts.scoreGiven.value ?? assignedWork.value?.score ?? null
    })

    /**
     * Checks if the work is solved or not.
     */
    const workIsSolved = computed<boolean>(() =>
      isSolved(assignedWork.value?.solveStatus)
    )

    /**
     * Checks if the work is checked or not.
     */
    const workIsChecked = computed<boolean>(() =>
      isChecked(assignedWork.value?.checkStatus)
    )

    /**
     * Checks if the work is remakeable or not.
     */
    const workIsRemakeable = computed<boolean>(
      () => assignedWork.value?.work?.type === 'test'
    )

    return {
      assignedWork,
      answers: answerDrafts.answers,
      ownComment: commentDraft.draft,
      ownCommentSeat: commentDraft.seat,
      canEditOwnComment,
      commentOf: commentDraft.contentOf,
      updateComment: commentDraft.update,
      init,
      setMode,
      viewMode,
      save,
      markChecked,
      markSolved,
      remake,
      shiftSolveDeadline,
      shiftCheckDeadline,
      markUnsolved,
      markUnchecked,
      addHelperMentor,
      saveStatus,
      hasUnsavedChanges,
      isAutosaveEnabled,
      getTask,
      updateAnswer: answerDrafts.update,
      totalScore,
      workIsSolved,
      workIsChecked,
      workIsRemakeable,
      allTasksAreSolved: answerDrafts.allTasksAreAnswered,
      reset
    }
  }
)

export { useAssignedWorkDetailStore }
