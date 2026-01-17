import { useEntityValidation } from '@/core/composables/useEntityValidation'
import { useViewMode, type ViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { convertToLocal, uid } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { emptyRichText } from '@/core/utils/richtext.utils'
import type { ValidationState } from '@/core/validators/validation-state.utils'
import { defineStore } from 'pinia'
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
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
   * Task validation state.
   */
  taskValidationState: Ref<ValidationState>
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
    const workValidation = useEntityValidation(work, validateWorkState)
    const taskValidation = useEntityValidation(task, validateWorkTaskState)

    function createEmptyWork(): PossiblyUnsavedWork {
      return {
        _entityName: 'Work',
        _key: uid(),
        title: '',
        type: 'test',
        description: null,
        tasks: [],
        subjectId: ''
      }
    }

    function createTaskDraft(
      type: WorkTaskType = 'word'
    ): PossiblyUnsavedWorkTask {
      return {
        _entityName: 'WorkTask',
        _key: uid(),
        order: (work.value?.tasks?.length ?? 0) + 1,
        content: emptyRichText(),
        type,
        checkStrategy: type === 'word' ? 'exact-match-or-zero' : 'manual',
        maxScore: 1,
        rightAnswers: type === 'word' ? ['Правильный ответ'] : null,
        explanation: null,
        solveHint: null,
        showAnswerBeforeCheck: false,
        checkOneByOne: false
      }
    }

    function getTaskIndexById(taskId?: PossiblyUnsavedWorkTask['id']): number {
      return work.value?.tasks?.findIndex((t) => t.id === taskId) ?? -1
    }

    function moveTaskBy(offset: number): void {
      if (!work.value || !task.value) {
        return
      }

      const currentIndex = getTaskIndexById(task.value.id)
      const nextIndex = currentIndex + offset
      const tasks = work.value.tasks ?? []

      if (nextIndex >= 0 && nextIndex < tasks.length) {
        task.value = tasks[nextIndex] ?? null
      }
    }

    function validateWork(): void {
      if (!work.value) {
        workValidation.reset()
        taskValidation.reset()

        return
      }

      workValidation.validate()
    }

    async function init(workId?: string): Promise<void> {
      if (!workId) {
        setMode('create')
        work.value = createEmptyWork()
        workPatchGenerator.value = null

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
      moveTaskBy(1)
    }

    function previousTask(): void {
      moveTaskBy(-1)
    }

    function addTask(type: WorkTaskType = 'word'): void {
      if (!work.value?.tasks) {
        return
      }

      work.value.tasks.push(createTaskDraft(type))

      validateWork()
      taskValidation.validate()
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

          return
        }

        router.replace({
          name: 'works.edit',
          params: { workId: response.data.id }
        })

        uiStore.createSuccessToast('Работа успешно создана')

        return
      }

      if (mode.value === 'edit') {
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

          return
        }

        uiStore.createSuccessToast('Работа успешно обновлена')
        await init(work.value.id)
      }
    }

    function reset(): void {
      work.value = null
      task.value = null
      workPatchGenerator.value = null
      resetMode()
      workValidation.reset()
      taskValidation.reset()
    }

    return {
      workValidationState: workValidation.validationState,
      taskValidationState: taskValidation.validationState,
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
