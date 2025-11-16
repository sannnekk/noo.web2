import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { UnsavedEntity } from '@/core/utils/types.utils'
import { defineStore } from 'pinia'
import { SnippetService } from '../api/snippet.service'
import type { SnippetEntity } from '../api/snippet.types'

interface SnippetStore {
  /**
   * List of snippets associated with the assigned works.
   */
  snippets: UseApiRequestReturn<void, SnippetEntity[]>
  /**
   * Adds a new snippet to the store.
   * @param snippet The snippet to add.
   */
  addSnippet: UseApiRequestReturn<UnsavedEntity<SnippetEntity>, { id: string }>
  /**
   * Updates an existing snippet in the store.
   * @param snippet The snippet to update.
   */
  updateSnippet: UseApiRequestReturn<SnippetEntity>
  /**
   * Deletes a snippet from the store by its ID.
   * @param snippetId The ID of the snippet to delete.
   */
  deleteSnippet: UseApiRequestReturn<string>
}

const useSnippetStore = defineStore(
  'assigned-works:snippet',
  (): SnippetStore => {
    const uiStore = useGlobalUIStore()

    const snippets = useApiRequest<void, SnippetEntity[]>(SnippetService.get)

    const addSnippet = useApiRequest<
      UnsavedEntity<SnippetEntity>,
      { id: string }
    >(
      SnippetService.create,
      () => {
        uiStore.createSuccessToast('Сниппет успешно добавлен!')
        snippets.execute()
      },
      (error) =>
        uiStore.createApiErrorToast('Ошибка при добавлении сниппета', error)
    )

    const updateSnippet = useApiRequest<SnippetEntity>(
      (snippet) => {
        return SnippetService.update(snippet.id, snippet)
      },
      () => {
        uiStore.createSuccessToast('Сниппет обновлен')
        snippets.execute()
      },
      (error) =>
        uiStore.createApiErrorToast('Ошибка при обновлении сниппета', error)
    )

    const deleteSnippet = useApiRequest(
      SnippetService.delete,
      () => {
        uiStore.createSuccessToast('Сниппет удален')
        snippets.execute()
      },
      (error) =>
        uiStore.createApiErrorToast('Ошибка при удалении сниппета', error)
    )

    return {
      snippets,
      addSnippet,
      updateSnippet,
      deleteSnippet
    }
  }
)

export { useSnippetStore, type SnippetStore }
