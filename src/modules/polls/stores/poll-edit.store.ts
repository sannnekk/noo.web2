import { isApiError } from '@/core/api/api.utils'
import { useViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { defineStore } from 'pinia'
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { PollService } from '../api/poll.service'
import type { PossiblyUnsavedPoll } from '../api/poll.types'
import type { PollViewMode } from '../types'
import { toPossiblyUnsaved } from '../utils'

interface PollEditStore {
  /**
   * Mode: view, create or edit
   */
  mode: Ref<PollViewMode>
  /**
   * Sets the current mode.
   */
  setMode: (value: PollViewMode) => void
  /**
   *  The poll being edited. It can be null if no poll is being edited.
   */
  poll: Ref<PossiblyUnsavedPoll | null>
  /**
   * Responsible to generate JSON Patch document for updating the poll.
   */
  pollPatchGenerator: ShallowRef<PatchGenerator<PossiblyUnsavedPoll> | null>
  /**
   * Saves the current poll.
   */
  save: () => Promise<void>
  /**
   * Adds a new question to the current poll.
   */
  addQuestion: () => void
  /**
   * Removes a question from the current poll.
   * @param key - The key of the question to remove.
   */
  removeQuestion: (key: string) => void
  /**
   * Initializes the store with a poll ID, typically in a navigation guard.
   * If no ID is provided, it initializes a new poll.
   */
  init: (pollId?: string) => Promise<void>
  /**
   * Resets the store to its initial state, clearing the current poll.
   */
  reset: () => void
  /**
   * Checks if there are any unsaved changes.
   */
  hasChanges: () => boolean
  /**
   * Cancels the current edit and reverts changes.
   */
  cancelEdit: () => void
}

const usePollEditStore = defineStore('polls:poll-edit', (): PollEditStore => {
  const uiStore = useGlobalUIStore()

  const { mode, setMode } = useViewMode('create')

  const poll = ref<PossiblyUnsavedPoll | null>(null)
  const pollPatchGenerator =
    shallowRef<PatchGenerator<PossiblyUnsavedPoll> | null>(null)

  async function init(pollId?: string): Promise<void> {
    if (!pollId) {
      setMode('create')
      poll.value = {
        _entityName: 'Poll',
        _key: uid(),
        title: 'Новый опрос',
        description: null,
        isActive: true,
        expiresAt: null,
        isAuthRequired: false,
        questions: []
      } as PossiblyUnsavedPoll
      pollPatchGenerator.value = null

      return
    }

    uiStore.setLoading(true)

    const response = await PollService.getById(pollId)

    if (isApiError(response)) {
      uiStore.createApiErrorToast('Не удалось загрузить опрос', response.error)
      uiStore.setLoading(false)

      return
    }

    if (!response.data) {
      uiStore.setLoading(false)

      return
    }

    poll.value = toPossiblyUnsaved(response.data)
    if (poll.value) {
      pollPatchGenerator.value = JsonPatchUtils.observe(poll.value)
    }
    setMode('view')
    uiStore.setLoading(false)
  }

  function reset(): void {
    poll.value = null
    pollPatchGenerator.value = null
  }

  function hasChanges(): boolean {
    return (pollPatchGenerator.value?.countChanges() ?? 0) > 0
  }

  function cancelEdit(): void {
    if (!poll.value) {
      return
    }

    if (pollPatchGenerator.value) {
      poll.value = pollPatchGenerator.value.getOriginal()
      if (poll.value) {
        pollPatchGenerator.value = JsonPatchUtils.observe(poll.value)
      }
    }

    setMode('view')
  }

  async function save(): Promise<void> {
    if (!poll.value) {
      return
    }

    uiStore.setLoading(true)

    if (poll.value?.id) {
      if (!pollPatchGenerator.value) {
        uiStore.setLoading(false)

        return
      }

      const response = await PollService.update(
        poll.value.id,
        pollPatchGenerator.value.generate()
      )

      uiStore.setLoading(false)

      if (isApiError(response)) {
        uiStore.createApiErrorToast(
          'Не удалось сохранить опрос',
          response.error
        )

        return
      }

      uiStore.createSuccessToast('Опрос сохранен')
      await init(poll.value.id)
    } else {
      const response = await PollService.create(poll.value)

      uiStore.setLoading(false)

      if (isApiError(response)) {
        uiStore.createApiErrorToast(
          'Не удалось сохранить опрос',
          response.error
        )

        return
      }

      uiStore.createSuccessToast('Опрос сохранен')

      if (response.data?.id) {
        useRouter().push({
          name: 'polls.edit',
          params: { pollId: response.data.id }
        })
      }
    }
  }

  function addQuestion(): void {
    if (!poll.value) {
      return
    }

    poll.value.questions = [
      ...(poll.value?.questions ?? []),
      {
        _entityName: 'PollQuestion',
        _key: uid(),
        title: 'Новый вопрос',
        description: null,
        type: 'text',
        isRequired: false,
        config: {}
      }
    ]
  }

  function removeQuestion(key: string): void {
    if (!poll.value) {
      return
    }

    poll.value.questions = poll.value.questions.filter((q) => q._key !== key)
  }

  return {
    mode,
    setMode,
    poll,
    pollPatchGenerator,
    init,
    reset,
    save,
    addQuestion,
    removeQuestion,
    hasChanges,
    cancelEdit
  }
})

export { usePollEditStore }
