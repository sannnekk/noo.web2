import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter, type IFilter } from '@/core/utils/pagination.utils'
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
import type { AssignedWorkListTab } from '../types'

interface AssignedWorkListStore {
  metadata: UseApiRequestReturn<void, AssignedWorksMetadata>
  counts: ComputedRef<Record<AssignedWorkListTab, number | undefined>>
  allSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  notMadeSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  notCheckedSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  checkedSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
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

function tabFilters(tab: AssignedWorkListTab): IFilter[] {
  return [new EqualsFilter<AssignedWorkTabQuery>('Tab', tabQueries[tab].apiTab)]
}

const useAssignedWorkListStore = defineStore(
  'assigned-works:assigned-work-list',
  (): AssignedWorkListStore => {
    const authStore = useAuthStore()
    const userId = computed(() => authStore.userId!)

    const metadata = useApiRequest(() =>
      AssignedWorkService.getMetadata(userId.value)
    )

    const counts = computed(() => {
      const fetchedCounts = metadata.data.value?.counts

      return mapValues(tabQueries, ({ counter }) => fetchedCounts?.[counter])
    })

    function onTabChange(newTab: AssignedWorkListTab) {
      switch (newTab) {
        case 'all':
          allSearch.reloadIfEmpty()
          break
        case 'not-made':
          notMadeSearch.reloadIfEmpty()
          break
        case 'not-checked':
          notCheckedSearch.reloadIfEmpty()
          break
        case 'checked':
          checkedSearch.reloadIfEmpty()
          break
      }
    }

    const allSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      { immediate: true, initialFilters: tabFilters('all') }
    )

    const notMadeSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      { immediate: false, initialFilters: tabFilters('not-made') }
    )

    const notCheckedSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      { immediate: false, initialFilters: tabFilters('not-checked') }
    )

    const checkedSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      { immediate: false, initialFilters: tabFilters('checked') }
    )

    return {
      metadata,
      counts,
      allSearch,
      notMadeSearch,
      notCheckedSearch,
      checkedSearch,
      onTabChange
    }
  }
)

export { useAssignedWorkListStore }
