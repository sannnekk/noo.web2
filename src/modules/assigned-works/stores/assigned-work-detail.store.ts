import type { ApiError } from '@/core/api/api.utils'
import { isApiError } from '@/core/api/api.utils'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useSaveStatus } from '@/core/composables/useSaveStatus'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { DateHelpers } from '@/core/utils/dates'
import { uid } from '@/core/utils/id.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
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
import { AssignedWorkConfig } from '../config'
import { assignedWorkApiResponse } from '../mock-data/assigned-work-api-response'
import type { AssignedWorkViewMode, PossiblyUnsavedAnswer } from '../types'

export interface AssignedWorkDetailStore {
  assignedWork: ShallowRef<AssignedWorkEntity | undefined>
  answers: Ref<Record<string, PossiblyUnsavedAnswer>>
  markSolved: UseApiRequestReturn
  markChecked: UseApiRequestReturn
  remake: UseApiRequestReturn<AssignedWorkRemakeOptions, { id: string }>
  shiftSolveDeadline: UseApiRequestReturn
  shiftCheckDeadline: UseApiRequestReturn
  markUnsolved: UseApiRequestReturn
  markUnchecked: UseApiRequestReturn
  addHelperMentor: UseApiRequestReturn<AddHelperMentorOptions>
  saveStatus: ReturnType<typeof useSaveStatus>
  isStateSaved: ComputedRef<boolean>
  init: (assignedWorkId: string) => Promise<boolean>
  setMode: (mode: AssignedWorkViewMode) => void
  save: () => Promise<void>
  shiftDeadline: UseApiRequestReturn
  getTask: (taskId: string) => WorkTaskEntity | undefined
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
     * Map of the answers with task IDs as keys.
     */
    const answers = ref<Record<string, PossiblyUnsavedAnswer>>({})

    /**
     * If all answers are saved or not.
     */
    const isStateSaved = computed<boolean>(() =>
      Object.values(answers.value).some((answer) => !answer.isSaved)
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function init(assignedWorkId: string): Promise<boolean> {
      globalUiStore.setLoading(true, undefined, 'Загрузка работы...')

      await new Promise((resolve) => setTimeout(resolve, 500))
      /* const apiResponse =
        Math.random() > 0.5
          ? assignedWorkApiResponse
          : {
              error: {
                id: 'UNKNWOWN_ERROR',
                name: 'Неизвестная ошибка',
                statusCode: 500,
                payload: null
              } as ApiError
            } */
      const apiResponse = assignedWorkApiResponse

      //const apiResponse = await AssignedWorkService.getById(assignedWorkId)

      if (isApiError(apiResponse)) {
        globalUiStore.setLoading(false)
        globalUiStore.createApiErrorToast(
          'Не удалось загрузить работу',
          apiResponse.error
        )

        return false
      }

      if (!apiResponse.data) {
        globalUiStore.setLoading(false)

        return false
      }

      assignedWork.value = apiResponse.data
      setSavedAnswers(apiResponse.data.answers ?? [])
      setEmptyAnswers()
      globalUiStore.setLoading(false)

      return true
    }

    /**
     * Set the view mode of the assigned work.
     */
    function setMode(mode: AssignedWorkViewMode): void {
      viewMode.value = mode
    }

    /**
     * Saves the answers to the server.
     */
    async function save(): Promise<void> {
      const changedAnswers = getChangedAnswers()

      if (changedAnswers.length === 0) {
        globalUiStore.createSuccessToast('Работа сохранена')

        return
      }

      globalUiStore.setLoading(true, undefined, 'Сохранение работы...')

      const answerIdsByTaskId: Record<string, string> = {}

      for (const answer of changedAnswers as AssignedWorkAnswerEntity[]) {
        const response = await AssignedWorkService.saveAnswer(
          assignedWork.value!.id,
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
          globalUiStore.setLoading(false)
          globalUiStore.createApiErrorToast(
            'Не удалось сохранить работу',
            response.error
          )

          return
        }

        if (response.data) {
          answerIdsByTaskId[answer.taskId] = response.data.id
        }
      }

      setSavedAnswerIds(answerIdsByTaskId)
      globalUiStore.setLoading(false)
      saveStatus.pushSaveStatus()
    }

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
     * Shifts the deadline request
     */
    const shiftDeadline = useApiRequest(
      () => {
        const newDeadline = DateHelpers.addDays(
          assignedWork.value!.solveDeadlineAt,
          AssignedWorkConfig.solveDeadlineShift
        )

        if (!newDeadline) {
          return Promise.resolve({
            error: {
              id: 'INVALID_DEADLINE',
              statusCode: 0,
              name: 'Invalid deadline',
              description:
                'Невозможно сдвинуть дедлайн: текущий дедлайн отсутствует',
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
        globalUiStore.createSuccessToast('Дедлайн успешно сдвинут')
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
     * Shifts the solve deadline of the assigned work.
     */
    const shiftSolveDeadline = useApiRequest(
      () => {
        const newDeadline = DateHelpers.addDays(
          assignedWork.value!.solveDeadlineAt,
          AssignedWorkConfig.solveDeadlineShift
        )

        if (!newDeadline) {
          return Promise.resolve({
            error: {
              id: 'INVALID_DEADLINE',
              statusCode: 0,
              name: 'Invalid deadline',
              description:
                'Невозможно сдвинуть дедлайн: текущий дедлайн отсутствует',
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
        globalUiStore.createSuccessToast('Дедлайн успешно сдвинут')
        assignedWork.value!.solveDeadlineAt = DateHelpers.addDays(
          assignedWork.value!.solveDeadlineAt,
          AssignedWorkConfig.solveDeadlineShift
        )
        assignedWork.value!.checkDeadlineAt = DateHelpers.addDays(
          assignedWork.value!.checkDeadlineAt,
          AssignedWorkConfig.checkDeadlineShiftWhileSolveDeadlineShift
        )
      },
      (error) => {
        globalUiStore.createApiErrorToast('Не удалось сдвинуть дедлайн', error)
      }
    )

    /**
     * Shifts the check deadline of the assigned work.
     */
    const shiftCheckDeadline = useApiRequest(
      () => {
        const newDeadline = DateHelpers.addDays(
          assignedWork.value!.checkDeadlineAt,
          AssignedWorkConfig.checkDeadlineShift
        )

        if (!newDeadline) {
          return Promise.resolve({
            error: {
              id: 'INVALID_DEADLINE',
              statusCode: 0,
              name: 'Invalid deadline',
              description:
                'Невозможно сдвинуть дедлайн проверки: текущий дедлайн отсутствует',
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
        globalUiStore.createSuccessToast('Дедлайн проверки успешно сдвинут')
        assignedWork.value!.checkDeadlineAt = DateHelpers.addDays(
          assignedWork.value!.checkDeadlineAt,
          AssignedWorkConfig.checkDeadlineShift
        )
      },
      (error) => {
        globalUiStore.createApiErrorToast(
          'Не удалось сдвинуть дедлайн проверки',
          error
        )
      }
    )

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
      answers.value = {}
      saveStatus.reset()
    }

    /**
     * Gets the answers that are not saved yet.
     *
     * @returns The array of changed answers
     */
    function getChangedAnswers(): PossiblyUnsavedAnswer[] {
      return Object.values(answers.value).filter((answer) => !answer.isSaved)
    }

    /**
     * Gets the task by ID.
     */
    function getTask(taskId: string): WorkTaskEntity | undefined {
      return assignedWork.value?.work?.tasks?.find((task) => task.id === taskId)
    }

    /**
     * Sets the saved answers to the store.
     *
     * @param newAnswers The array of assigned work answers to set.
     */
    function setSavedAnswers(newAnswers: AssignedWorkAnswerEntity[]): void {
      answers.value = newAnswers.reduce<Record<string, PossiblyUnsavedAnswer>>(
        (acc, answer) => {
          // @ts-expect-error Change to PossiblyUnsavedAnswer
          acc[answer.taskId] = {
            ...answer,
            isSaved: true
          }

          return acc
        },
        {}
      )
    }

    /**
     * Sets empty answers for all tasks in the assigned work.
     * This is used to initialize the answers when the assigned work is loaded.
     */
    function setEmptyAnswers(): void {
      for (const task of assignedWork.value?.work?.tasks ?? []) {
        if (!answers.value[task.id]) {
          answers.value[task.id] = {
            _entityName: 'AssignedWorkAnswer',
            _key: uid(),
            taskId: task.id,
            isSaved: false,
            status: 'not-submitted',
            richTextContent: null,
            wordContent: null,
            mentorComment: null,
            detailedScore: null,
            score: null,
            maxScore: task.maxScore
          }
        }
      }
    }

    /**
     * Marks the answers as saved and sets their IDs.
     *
     * @param answerIds The map with task IDs as keys and answer IDs as values.
     */
    function setSavedAnswerIds(answerIds: Record<string, string>): void {
      for (const [taskId, answerId] of Object.entries(answerIds)) {
        const answer = answers.value[taskId]

        answer.id = answerId
        answer.isSaved = true
      }
    }

    /**
     * Checks if the work is solved or not.
     */
    const workIsSolved = computed<boolean>(
      () => assignedWork.value?.solveStatus === 'solved'
    )

    /**
     * Checks if the work is checked or not.
     */
    const workIsChecked = computed<boolean>(
      () => assignedWork.value?.checkStatus === 'checked'
    )

    /**
     * Checks if the work is remakeable or not.
     */
    const workIsRemakeable = computed<boolean>(
      () => assignedWork.value?.work?.type === 'test'
    )

    /**
     * Checks if all tasks are solved.
     */
    const allTasksAreSolved = computed<boolean>(() => {
      return (
        assignedWork.value?.work?.tasks?.every(
          (task) => answers.value[task.id].isSaved
        ) ?? false
      )
    })

    return {
      assignedWork,
      answers,
      init,
      setMode,
      save,
      markChecked,
      markSolved,
      remake,
      shiftDeadline,
      shiftSolveDeadline,
      shiftCheckDeadline,
      markUnsolved,
      markUnchecked,
      addHelperMentor,
      saveStatus,
      isStateSaved,
      getTask,
      workIsSolved,
      workIsChecked,
      workIsRemakeable,
      allTasksAreSolved,
      reset
    }
  }
)

export { useAssignedWorkDetailStore }
