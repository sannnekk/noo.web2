import type { ApiResponse } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
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
  mode: ShallowRef<PollViewMode>
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

  const mode = shallowRef<PollViewMode>('create')

  const poll = ref<PossiblyUnsavedPoll | null>(null)

  async function init(pollId?: string): Promise<void> {
    if (!pollId) {
      mode.value = 'create'
      poll.value = {
        _entityName: 'Poll',
        _key: uid(),
        title: 'Новый опрос',
        description: null,
        isActive: true,
        questions: []
      } as PossiblyUnsavedPoll

      return
    }

    uiStore.setLoading(true)

    const response = await PollService.getById(pollId)

    if (response.error) {
      uiStore.createApiErrorToast('Не удалось загрузить опрос', response.error)
      uiStore.setLoading(false)

      return
    }

    poll.value = toPossiblyUnsaved(response.data)
    mode.value = 'update'
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

    let response: ApiResponse | ApiResponse<{ id: string }>

    if (poll.value?.id) {
      response = await PollService.update(poll.value.id, poll.value)
    } else {
      response = await PollService.create(poll.value)
    }

    uiStore.setLoading(false)

    if (response.error) {
      uiStore.createApiErrorToast('Не удалось сохранить опрос', response.error)
    }

    uiStore.createSuccessToast('Опрос сохранен')

    if (response?.data?.id) {
      useRouter().push({
        name: 'polls.edit',
        params: { pollId: response?.data?.id }
      })
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
