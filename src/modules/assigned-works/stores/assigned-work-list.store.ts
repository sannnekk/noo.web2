import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { mapValues } from 'lodash'
import { defineStore } from 'pinia'
import { computed, type ComputedRef } from 'vue'
import { AssignedWorkService } from '../api/assigned-work.service'
import type {
  AssignedWorkEntity,
  AssignedWorksMetadata,
  AssignedWorkTabQuery
} from '../api/assigned-work.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { isApiError } from '@/core/api/api.utils'
import type { AssignedWorkListTab } from '../types'

type TabSearches = Record<
  AssignedWorkListTab,
  ReturnType<typeof useSearch<AssignedWorkEntity>>
>

interface AssignedWorkListStore {
  metadata: UseApiRequestReturn<void, AssignedWorksMetadata>
  /** One paginated search per tab, keyed the same way everything else here is. */
  searches: TabSearches
  /**
   * Archives every given work, then reloads what the list is showing so the
   * rows that just left the user's view actually go.
   */
  archive: (works: AssignedWorkEntity[]) => Promise<void>
  counts: ComputedRef<Record<AssignedWorkListTab, number | undefined>>
  onTabChange: (newTab: AssignedWorkListTab) => void
}

/**
 * The one place the tabs of the list page are wired up: the slice of the list the API is
 * asked for, and the counter of the metadata that belongs to it. A tab takes both from the
 * same entry, so it cannot show a count that belongs to another slice.
 */
const tabQueries: Record<
  AssignedWorkListTab,
  {
    apiTab: AssignedWorkTabQuery
    counter: keyof AssignedWorksMetadata['counts']
  }
> = {
  all: { apiTab: 'all', counter: 'all' },
  'not-made': { apiTab: 'not-solved', counter: 'notSolved' },
  'not-checked': { apiTab: 'not-checked', counter: 'notChecked' },
  checked: { apiTab: 'checked', counter: 'checked' }
}

const useAssignedWorkListStore = defineStore(
  'assigned-works:assigned-work-list',
  (): AssignedWorkListStore => {
    const authStore = useAuthStore()
    const globalUiStore = useGlobalUIStore()
    const userId = computed(() => authStore.userId!)

    const metadata = useApiRequest(() =>
      AssignedWorkService.getMetadata(userId.value)
    )

    const counts = computed(() => {
      const fetchedCounts = metadata.data.value?.counts

      return mapValues(tabQueries, ({ counter }) => fetchedCounts?.[counter])
    })

    // Only the tab the page opens on loads eagerly; the rest wait until the user
    // asks for them (see `onTabChange`).
    const searches = mapValues(tabQueries, ({ apiTab }, tab) =>
      useSearch((pagination) => AssignedWorkService.get(pagination), {
        immediate: tab === 'all',
        initialFilters: [new EqualsFilter<AssignedWorkTabQuery>('Tab', apiTab)]
      })
    ) as TabSearches

    async function archive(works: AssignedWorkEntity[]): Promise<void> {
      const results = await Promise.all(
        works.map((work) => AssignedWorkService.archive(work.id))
      )

      const failed = results.filter(isApiError)

      if (failed.length > 0) {
        globalUiStore.createApiErrorToast(
          failed.length === works.length
            ? 'Не удалось архивировать работы'
            : `Не удалось архивировать работы: ${failed.length} из ${works.length}`,
          failed[0].error
        )
      } else {
        globalUiStore.createSuccessToast(
          works.length === 1 ? 'Работа архивирована' : 'Работы архивированы'
        )
      }

      await Promise.all([
        ...Object.values(searches).map((search) => search.reload()),
        metadata.execute()
      ])
    }

    function onTabChange(newTab: AssignedWorkListTab) {
      searches[newTab].reloadIfEmpty()
    }

    return {
      metadata,
      archive,
      counts,
      searches,
      onTabChange
    }
  }
)

export { useAssignedWorkListStore }
