import { useViewMode, type ViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { convertToLocal, uid } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { emptyRichText } from '@/core/utils/richtext.utils'
import {
  buildValidationStateFromZodResult,
  createValidationState,
  type ValidationState
} from '@/core/validators/validation-state.utils'
import type { ZodFieldErrors } from '@/core/validators/zod-validation.utils'
import { defineStore } from 'pinia'
import { ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { WorkService } from '../api/work.service'
import type { WorkEntity, WorkTaskType } from '../api/work.types'
import type { PossiblyUnsavedWork, PossiblyUnsavedWorkTask } from '../types'
import { validateWorkState, validateWorkTaskState } from '../utils'

interface WorkDetailStore {
  /**
   * Currently viewed or edited work.
   * If `null`, no work is being viewed or edited.
   */
  work: Ref<PossiblyUnsavedWork | null>
  /**
   * Responsible to generate JSON Patch document for updating the work.
   */
  workPatchGenerator: ShallowRef<PatchGenerator<PossiblyUnsavedWork> | null>
  /**
   * Currently viewed or edited task within the work.
   * If `null`, no task is being viewed or edited.
   */
  task: Ref<PossiblyUnsavedWorkTask | null>
  /**
   * Current mode of the work view.
   */
  mode: Ref<ViewMode>
  /**
   * Work validation state.
   */
  workValidationState: Ref<ValidationState>
  /**
   * Validation errors for work fields.
   */
  workFieldErrors: Ref<ZodFieldErrors>
  /**
   * Validation errors for current task fields.
   */
  taskFieldErrors: Ref<ZodFieldErrors>
  /**
   * Validates the current work.
   * This function should be implemented to check the work's validity.
   */
  validateWork: () => void
  /**
   * Initializes the store with the specified work ID.
   * If no ID is provided, it creates a new work.
   *
   * @param workId The ID of the work to view or edit.
   */
  init: (workId?: string) => Promise<void>
  /**
   * Moves to the next task in the work.
   */
  nextTask: () => void
  /**
   * Moves to the previous task in the work.
   */
  previousTask: () => void
  /**
   * Adds a new task to the work.
   *
   * @param type The type of the task to add.
   */
  addTask: () => void
  /**
   * Removes a task from the work by its key.
   *
   * @param key The key of the task to remove.
   */
  removeTask: (key: string) => void
  /**
   * Saves the current work.
   * If in 'create' mode, it creates a new work.
   * If in 'edit' mode, it updates the existing work.
   */
  save: () => Promise<void>
  /**
   * Resets the store to its initial state.
   */
  reset: () => void
}

const useWorkDetailStore = defineStore(
  'works:work-detail',
  (): WorkDetailStore => {
    const uiStore = useGlobalUIStore()
    const router = useRouter()

    const work = ref<PossiblyUnsavedWork | null>(null)
    const workPatchGenerator =
      shallowRef<PatchGenerator<PossiblyUnsavedWork> | null>(null)
    const task = ref<PossiblyUnsavedWorkTask | null>(null)
    const { mode, resetMode, setMode } = useViewMode('view')
    const workValidationState = ref<ValidationState>(createValidationState())
    const workFieldErrors = ref<ZodFieldErrors>({})
    const taskFieldErrors = ref<ZodFieldErrors>({})

    function validateWork(): void {
      if (!work.value) {
        workFieldErrors.value = {}
        workValidationState.value = createValidationState()

        return
      }

      const result = validateWorkState(work.value)

      workValidationState.value = buildValidationStateFromZodResult(result)

      workFieldErrors.value = result.fieldErrors
    }

    function validateTask(): void {
      if (!task.value) {
        taskFieldErrors.value = {}

        return
      }

      const result = validateWorkTaskState(task.value)

      taskFieldErrors.value = result.fieldErrors
    }

    async function init(workId?: string): Promise<void> {
      if (typeof workId === 'undefined') {
        setMode('create')
        work.value = {
          _entityName: 'Work',
          _key: uid(),
          title: '',
          type: 'test',
          description: null,
          tasks: [],
          subjectId: ''
        }

        return
      }

      setMode('loading')

      const response = await WorkService.getById(workId)

      if (response.error) {
        uiStore.createApiErrorToast(
          'Не удалось загрузить работу',
          response.error
        )

        setMode('error')

        return
      }

      const loadedWork = convertToLocal<
        WorkEntity,
        WorkEntity['_entityName'],
        PossiblyUnsavedWork
      >(response.data)

      work.value = loadedWork
      workPatchGenerator.value = JsonPatchUtils.observe(loadedWork)
      setMode('view')
      validateWork()
    }

    function nextTask(): void {
      if (work.value && task.value) {
        const currentIndex =
          work.value.tasks?.findIndex((t) => t.id === task.value?.id) ?? -1

        if (currentIndex < (work.value.tasks?.length ?? 0) - 1) {
          task.value = work.value.tasks?.[currentIndex + 1] ?? null
        }
      }
    }

    function previousTask(): void {
      if (work.value && task.value) {
        const currentIndex =
          work.value.tasks?.findIndex((t) => t.id === task.value?.id) ?? -1

        if (currentIndex > 0) {
          task.value = work.value.tasks?.[currentIndex - 1] ?? null
        }
      }
    }

    function addTask(type: WorkTaskType = 'word'): void {
      if (!work.value?.tasks) {
        return
      }

      work.value.tasks.push({
        _entityName: 'WorkTask',
        _key: uid(),
        order: work.value.tasks.length + 1,
        content: emptyRichText(),
        type,
        checkStrategy: type === 'word' ? 'exact-match-or-zero' : 'manual',
        maxScore: 1,
        rightAnswers: type === 'word' ? ['Правильный ответ'] : null,
        explanation: null,
        solveHint: null,
        showAnswerBeforeCheck: false,
        checkOneByOne: false
      })

      validateWork()
      validateTask()
    }

    function removeTask(key: string): void {
      if (!work.value?.tasks) {
        return
      }

      if (task.value?._key === key) {
        task.value = null
      }

      work.value.tasks = work.value.tasks.filter((t) => t._key !== key)

      validateWork()
    }

    async function save(): Promise<void> {
      if (!work.value) {
        return
      }

      if (mode.value === 'create') {
        setMode('loading')
        const response = await WorkService.create(work.value)

        if (response.error) {
          uiStore.createApiErrorToast(
            'Не удалось создать работу',
            response.error
          )

          setMode('create')
        } else {
          router.replace({
            name: 'works.edit',
            params: { workId: response.data.id }
          })

          uiStore.createSuccessToast('Работа успешно создана')
        }
      } else if (mode.value === 'edit') {
        setMode('loading')
        const response = await WorkService.update(
          work.value.id!,
          workPatchGenerator.value!.generate()
        )

        if (response.error) {
          uiStore.createApiErrorToast(
            'Не удалось обновить работу',
            response.error
          )

          setMode('edit')
        } else {
          uiStore.createSuccessToast('Работа успешно обновлена')
          await init(work.value.id)
        }
      }
    }

    function reset(): void {
      work.value = null
      task.value = null
      resetMode()
      workFieldErrors.value = {}
      taskFieldErrors.value = {}
    }

    watch(work, validateWork, { deep: true })
    watch(task, validateTask, { deep: true })

    return {
      workValidationState,
      workFieldErrors,
      taskFieldErrors,
      validateWork,
      work,
      workPatchGenerator,
      task,
      mode,
      init,
      addTask,
      removeTask,
      nextTask,
      previousTask,
      save,
      reset
    }
  }
)

export { useWorkDetailStore }
