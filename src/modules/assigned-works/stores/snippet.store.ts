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
  /**
   * Loads the list unless it is already loaded or in flight.
   */
  init: () => Promise<void>
}

const useSnippetStore = defineStore(
  'assigned-works:snippet',
  (): SnippetStore => {
    const uiStore = useGlobalUIStore()

    const snippets = useApiRequest<void, SnippetEntity[]>(
      SnippetService.get,
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить сниппеты', error),
      { trackProgress: false }
    )

    async function init(): Promise<void> {
      if (snippets.data.value || snippets.isLoading.value) {
        return
      }

      await snippets.execute()
    }

    return {
      snippets,
      init
    }
  }
)

export { useSnippetStore, type SnippetStore }
