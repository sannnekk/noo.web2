import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
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
  setUserId: (id: string) => void
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
    const userId = shallowRef<string>(authStore.userInfo!.id!)

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
      (pagination) => AssignedWorkService.get(pagination, userId.value),
      { immediate: true }
    )

    const notMadeSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination, userId.value),
      {
        immediate: false,
        initialFilters: [
          new EqualsFilter<SolveStatus>('SolveStatus', 'not-solved')
        ]
      }
    )

    const notCheckedSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination, userId.value),
      {
        immediate: false,
        initialFilters: [
          new EqualsFilter<SolveStatus>('SolveStatus', 'solved'),
          new EqualsFilter<CheckStatus>('CheckStatus', 'not-checked')
        ]
      }
    )

    const checkedSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination, userId.value),
      {
        immediate: false,
        initialFilters: [
          new EqualsFilter<CheckStatus>('CheckStatus', 'checked')
        ]
      }
    )

    function setUserId(id: string) {
      userId.value = id
    }

    return {
      metadata,
      setUserId,
      allSearch,
      notMadeSearch,
      notCheckedSearch,
      checkedSearch,
      onTabChange
    }
  }
)

export { useAssignedWorkListStore }
