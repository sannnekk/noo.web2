import { isApiError } from '@/core/api/api.utils'
import { useEntityValidation } from '@/core/composables/useEntityValidation'
import { useViewMode, type ViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { convertToLocal } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
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
   * @param taskId The ID of the task to pre-select once the work is loaded.
   */
  init: (workId?: string, taskId?: string) => Promise<void>
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
   * Numbers the tasks by the position they now sit in. Call after the task list
   * has been rearranged — the sequence is carried by `order`, nothing else.
   */
  reorderTasks: () => void
  /**
   * Whether the work carries edits that have not been saved yet.
   */
  hasChanges: () => boolean
  /**
   * Saves the current work, and reports whether it went through.
   * If in 'create' mode, it creates a new work.
   * If in 'edit' mode, it updates the existing work.
   */
  save: () => Promise<boolean>
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

    async function init(workId?: string, taskId?: string): Promise<void> {
      if (!workId) {
        setMode('create')
        work.value = WorkService.createDraft()
        workPatchGenerator.value = null

        return
      }

      setMode('loading')

      const response = await WorkService.getById(workId)

      if (isApiError(response)) {
        uiStore.createApiErrorToast(
          'Не удалось загрузить работу',
          response.error
        )

        setMode('error')

        return
      }

      if (!response.data) {
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

      if (taskId) {
        task.value = loadedWork.tasks?.find((t) => t.id === taskId) ?? null
      }
    }

    function nextTask(): void {
      moveTaskBy(1)
    }

    function previousTask(): void {
      moveTaskBy(-1)
    }

    /**
     * Numbers the tasks by their position, so what the editor shows as "Задание №3"
     * is the third one.
     *
     * Called after anything that moves a task: adding, removing, or dragging one
     * into a new place. The position is the only way sequence is expressed — the
     * patch document keys tasks by id, so a task that merely moved produces no
     * operation of its own until its `order` changes. The server settles the same
     * thing on save; this is so the editor is not showing something else in the
     * meantime.
     */
    function reorderTasks(): void {
      work.value?.tasks?.forEach((task, index) => {
        task.order = index + 1
      })
    }

    function addTask(type: WorkTaskType = 'word'): void {
      if (!work.value?.tasks) {
        return
      }

      work.value.tasks.push(
        WorkService.createTaskDraft(type, work.value.tasks.length + 1)
      )

      reorderTasks()
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

      reorderTasks()
      validateWork()
    }

    function hasChanges(): boolean {
      return (workPatchGenerator.value?.countChanges() ?? 0) > 0
    }

    async function save(): Promise<boolean> {
      if (!work.value) {
        return false
      }

      if (mode.value === 'create') {
        setMode('loading')

        const response = await WorkService.create(work.value)

        if (isApiError(response)) {
          uiStore.createApiErrorToast(
            'Не удалось создать работу',
            response.error
          )

          setMode('create')

          return false
        }

        if (response.data) {
          router.replace({
            name: 'works.edit',
            params: { workId: response.data.id }
          })
        }

        uiStore.createSuccessToast('Работа успешно создана')

        return true
      }

      if (mode.value === 'edit') {
        setMode('loading')

        const response = await WorkService.update(
          work.value.id!,
          workPatchGenerator.value!.generate()
        )

        if (isApiError(response)) {
          uiStore.createApiErrorToast(
            'Не удалось обновить работу',
            response.error
          )

          setMode('edit')

          return false
        }

        uiStore.createSuccessToast('Работа успешно обновлена')
        await init(work.value.id)

        return true
      }

      return false
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
      reorderTasks,
      nextTask,
      previousTask,
      hasChanges,
      save,
      reset
    }
  }
)

export { useWorkDetailStore }
