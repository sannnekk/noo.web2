import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { SnippetService } from '../api/snippet.service'
import type { SnippetEntity } from '../api/snippet.types'

interface SnippetStore {
  /**
   * List of snippets available to the current user.
   */
  snippets: UseApiRequestReturn<void, SnippetEntity[]>
}

const useSnippetStore = defineStore(
  'assigned-works:snippet',
  (): SnippetStore => {
    const uiStore = useGlobalUIStore()

    const snippets = useApiRequest<void, SnippetEntity[]>(
      SnippetService.get,
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить сниппеты', error)
    )

    return {
      snippets
    }
  }
)

export { useSnippetStore, type SnippetStore }
