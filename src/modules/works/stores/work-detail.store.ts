import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
import { emptyRichText } from '@/core/utils/richtext.utils'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { WorkEntity, WorkTaskType } from '../api/work.types'
import { workApiResponse } from '../mock-data/work-api-response'
import type {
  PossiblyUnsavedWork,
  PossiblyUnsavedWorkTask,
  WorkViewMode
} from '../types'
import { validateWorkState } from '../utils'

interface WorkDetailStore {
  work: Ref<PossiblyUnsavedWork | null>
  task: Ref<PossiblyUnsavedWorkTask | null>
  mode: Ref<WorkViewMode>
  workValidationState: Ref<{
    isValid: boolean
    errors: string[]
  }>
  validateWork: () => void
  init: (workId?: string) => Promise<void>
  nextTask: () => void
  previousTask: () => void
  addTask: () => void
  removeTask: (key: string) => void
  save: () => Promise<void>
  reset: () => void
}

const useWorkDetailStore = defineStore(
  'works:work-detail',
  (): WorkDetailStore => {
    const uiStore = useGlobalUIStore()

    /**
     * Currently viewed or edited work.
     * If `null`, no work is being viewed or edited.
     */
    const work = ref<PossiblyUnsavedWork | null>(null)
    /**
     * Currently viewed or edited task within the work.
     * If `null`, no task is being viewed or edited.
     */
    const task = ref<PossiblyUnsavedWorkTask | null>(null)
    /**
     * Current mode of the work view.
     */
    const mode = ref<WorkViewMode>('view')
    /**
     * Work validation state.
     */
    const workValidationState = ref<{
      isValid: boolean
      errors: string[]
    }>({
      isValid: true,
      errors: []
    })

    /**
     * Validates the current work.
     * This function should be implemented to check the work's validity.
     */
    function validateWork(): void {
      if (!work.value) {
        return
      }

      const errors = validateWorkState(work.value)

      workValidationState.value = {
        isValid: errors.length === 0,
        errors
      }
    }

    /**
     * Initializes the store with the specified work ID.
     * If no ID is provided, it creates a new work.
     *
     * @param workId The ID of the work to view or edit.
     */
    async function init(workId?: string): Promise<void> {
      if (typeof workId === 'undefined') {
        mode.value = 'create'
        work.value = {
          _key: uid(),
          title: '',
          type: 'test',
          description: null,
          tasks: [],
          subjectId: ''
        }

        return
      }

      mode.value = 'view'

      uiStore.setLoading(true)

      // TODO: Fetch the work by ID from the API or store

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const response = workApiResponse

      if (response.data) {
        setWork(response.data)
      }

      uiStore.setLoading(false)
    }

    function setWork(value: WorkEntity): void {
      work.value = {
        ...value,
        _key: uid(),
        tasks:
          value.tasks?.map((task) => ({
            ...task,
            _key: uid()
          })) ?? []
      }
    }

    /**
     * Moves to the next task in the work.
     */
    function nextTask(): void {
      if (work.value && task.value) {
        const currentIndex =
          work.value.tasks?.findIndex((t) => t.id === task.value?.id) ?? -1

        if (currentIndex < (work.value.tasks?.length ?? 0) - 1) {
          task.value = work.value.tasks?.[currentIndex + 1] ?? null
        }
      }
    }

    /**
     * Moves to the previous task in the work.
     */
    function previousTask(): void {
      if (work.value && task.value) {
        const currentIndex =
          work.value.tasks?.findIndex((t) => t.id === task.value?.id) ?? -1

        if (currentIndex > 0) {
          task.value = work.value.tasks?.[currentIndex - 1] ?? null
        }
      }
    }

    /**
     * Adds a new task to the work.
     *
     * @param type The type of the task to add.
     */
    function addTask(type: WorkTaskType = 'word'): void {
      if (!work.value?.tasks) {
        return
      }

      work.value.tasks.push({
        _key: uid(),
        order: work.value.tasks.length + 1,
        content: emptyRichText(),
        type,
        checkStrategy: type === 'word' ? 'exact-match-or-zero' : 'manual',
        maxScore: 1,
        rightAnswer: type === 'word' ? 'Правильный ответ' : null,
        explanation: null,
        solveHint: null,
        showAnswerBeforeCheck: false,
        checkOneByOne: false
      })
    }

    /**
     * Removes a task from the work by its key.
     *
     * @param key The key of the task to remove.
     */
    function removeTask(key: string): void {
      if (!work.value?.tasks) {
        return
      }

      if (task.value?._key === key) {
        task.value = null
      }

      work.value.tasks = work.value.tasks.filter((t) => t._key !== key)
    }

    /**
     * Saves the current work.
     * If in 'create' mode, it creates a new work.
     * If in 'edit' mode, it updates the existing work.
     */
    async function save(): Promise<void> {
      if (mode.value === 'create') {
        // Create a new work
      } else if (mode.value === 'edit') {
        // Update the existing work
      }
    }

    function reset(): void {
      work.value = null
      task.value = null
      mode.value = 'view'
    }

    return {
      workValidationState,
      validateWork,
      work,
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
