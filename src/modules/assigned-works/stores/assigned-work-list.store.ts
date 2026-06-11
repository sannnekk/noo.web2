import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { AssignedWorkService } from '../api/assigned-work.service'
import type {
  AssignedWorkEntity,
  AssignedWorksMetadata,
  CheckStatus,
  SolveStatus
} from '../api/assigned-work.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import type { AssignedWorkListTab } from '../types'

interface AssignedWorkListStore {
  metadata: UseApiRequestReturn<void, AssignedWorksMetadata>
  allSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  notMadeSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  notCheckedSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  checkedSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  onTabChange: (newTab: AssignedWorkListTab) => void
}

const useAssignedWorkListStore = defineStore(
  'assigned-works:assigned-work-list',
  (): AssignedWorkListStore => {
    const authStore = useAuthStore()
    const userId = computed(() => authStore.userId!)

    const metadata = useApiRequest(() =>
      AssignedWorkService.getMetadata(userId.value)
    )

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
      { immediate: true }
    )

    const notMadeSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      {
        immediate: false,
        initialFilters: [
          new EqualsFilter<SolveStatus>('SolveStatus', 'not-solved')
        ]
      }
    )

    const notCheckedSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      {
        immediate: false,
        initialFilters: [
          new EqualsFilter<SolveStatus>('SolveStatus', 'solved'),
          new EqualsFilter<CheckStatus>('CheckStatus', 'not-checked')
        ]
      }
    )

    const checkedSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination),
      {
        immediate: false,
        initialFilters: [
          new EqualsFilter<CheckStatus>('CheckStatus', 'checked')
        ]
      }
    )

    return {
      metadata,
      allSearch,
      notMadeSearch,
      notCheckedSearch,
      checkedSearch,
      onTabChange
    }
  }
)

export { useAssignedWorkListStore }
