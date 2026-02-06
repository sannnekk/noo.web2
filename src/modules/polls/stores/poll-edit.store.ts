import { isApiError } from '@/core/api/api.utils'
import { useViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
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
   *  The poll being edited. It can be null if no poll is being edited.
   */
  poll: Ref<PossiblyUnsavedPoll | null>
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
}

const usePollEditStore = defineStore('polls:poll-edit', (): PollEditStore => {
  const uiStore = useGlobalUIStore()

  const { mode, setMode } = useViewMode('create')

  const poll = ref<PossiblyUnsavedPoll | null>(null)

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
    setMode('edit')
    uiStore.setLoading(false)
  }

  function reset(): void {
    poll.value = null
  }

  async function save(): Promise<void> {
    if (!poll.value) {
      return
    }

    uiStore.setLoading(true)

    if (poll.value?.id) {
      const response = await PollService.update(poll.value.id, poll.value)

      uiStore.setLoading(false)

      if (isApiError(response)) {
        uiStore.createApiErrorToast(
          'Не удалось сохранить опрос',
          response.error
        )

        return
      }

      uiStore.createSuccessToast('Опрос сохранен')
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
    poll,
    init,
    reset,
    save,
    addQuestion,
    removeQuestion
  }
})

export { usePollEditStore }
