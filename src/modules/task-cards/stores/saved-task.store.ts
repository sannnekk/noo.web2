import { isApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { SavedTaskService } from '../api/saved-task.service'

interface SavedTaskStore {
  /**
   * Ids of the saved tasks of the loaded assigned work, keyed by task id.
   */
  savedTaskIdsByTask: Ref<Record<string, string>>
  /**
   * Task ids whose save state is currently being changed.
   */
  pendingTaskIds: Ref<Set<string>>
  isLoading: ShallowRef<boolean>
  /**
   * Loads the save state of one assigned work's tasks, unless it is already
   * loaded or in flight. Every task of a work asks for the same state, so the
   * work already read is the one thing worth remembering here.
   */
  ensureLoaded: (assignedWorkId: string) => Promise<void>
  isSaved: (taskId: string) => boolean
  isPending: (taskId: string) => boolean
  toggle: (taskId: string, assignedWorkId: string) => Promise<void>
  reset: () => void
}

const useSavedTaskStore = defineStore(
  'task-cards:saved-task',
  (): SavedTaskStore => {
    const globalUiStore = useGlobalUIStore()

    const savedTaskIdsByTask = ref<Record<string, string>>({})
    const pendingTaskIds = ref<Set<string>>(new Set())
    const isLoading = shallowRef(false)

    const loadedAssignedWorkId = shallowRef<string | null>(null)
    const requestedAssignedWorkId = shallowRef<string | null>(null)

    async function ensureLoaded(assignedWorkId: string): Promise<void> {
      if (
        loadedAssignedWorkId.value === assignedWorkId ||
        requestedAssignedWorkId.value === assignedWorkId
      ) {
        return
      }

      // Another work's state is not this work's state, so it goes before the
      // request rather than after it.
      savedTaskIdsByTask.value = {}
      loadedAssignedWorkId.value = null
      requestedAssignedWorkId.value = assignedWorkId
      isLoading.value = true

      try {
        const response = await SavedTaskService.getReferences(assignedWorkId)

        // A newer request has taken over in the meantime
        if (requestedAssignedWorkId.value !== assignedWorkId) {
          return
        }

        if (isApiError(response)) {
          globalUiStore.createApiErrorToast(
            'Не удалось загрузить сохранённые задания',
            response.error
          )

          return
        }

        savedTaskIdsByTask.value = Object.fromEntries(
          (response.data ?? []).map(({ taskId, id }) => [taskId, id])
        )
        loadedAssignedWorkId.value = assignedWorkId
      } finally {
        if (requestedAssignedWorkId.value === assignedWorkId) {
          requestedAssignedWorkId.value = null
          isLoading.value = false
        }
      }
    }

    function isSaved(taskId: string): boolean {
      return taskId in savedTaskIdsByTask.value
    }

    function isPending(taskId: string): boolean {
      return pendingTaskIds.value.has(taskId)
    }

    async function toggle(
      taskId: string,
      assignedWorkId: string
    ): Promise<void> {
      if (isPending(taskId)) {
        return
      }

      pendingTaskIds.value = new Set(pendingTaskIds.value).add(taskId)

      try {
        const savedTaskId = savedTaskIdsByTask.value[taskId]

        await (savedTaskId
          ? remove(taskId, savedTaskId)
          : add(taskId, assignedWorkId))
      } finally {
        const pending = new Set(pendingTaskIds.value)

        pending.delete(taskId)
        pendingTaskIds.value = pending
      }
    }

    async function add(taskId: string, assignedWorkId: string): Promise<void> {
      const response = await SavedTaskService.save({ taskId, assignedWorkId })

      if (isApiError(response)) {
        globalUiStore.createApiErrorToast(
          'Не удалось сохранить задание',
          response.error
        )

        return
      }

      if (!response.data) {
        return
      }

      savedTaskIdsByTask.value = {
        ...savedTaskIdsByTask.value,
        [taskId]: response.data.id
      }

      globalUiStore.createSuccessToast('Задание сохранено')
    }

    async function remove(taskId: string, savedTaskId: string): Promise<void> {
      const response = await SavedTaskService.delete(savedTaskId)

      if (isApiError(response)) {
        globalUiStore.createApiErrorToast(
          'Не удалось убрать задание из сохранённых',
          response.error
        )

        return
      }

      const remaining = { ...savedTaskIdsByTask.value }

      delete remaining[taskId]
      savedTaskIdsByTask.value = remaining

      globalUiStore.createSuccessToast('Задание убрано из сохранённых')
    }

    function reset(): void {
      savedTaskIdsByTask.value = {}
      pendingTaskIds.value = new Set()
      loadedAssignedWorkId.value = null
      requestedAssignedWorkId.value = null
    }

    return {
      savedTaskIdsByTask,
      pendingTaskIds,
      isLoading,
      ensureLoaded,
      isSaved,
      isPending,
      toggle,
      reset
    }
  }
)

export { useSavedTaskStore, type SavedTaskStore }
