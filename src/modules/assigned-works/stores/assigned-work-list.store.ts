import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { AssignedWorkService } from '../api/assigned-work.service'
import type {
  AssignedWorkEntity,
  CheckStatus,
  SolveStatus
} from '../api/assigned-work.types'

interface AssignedWorkListStore {
  setUserId: (id: string | undefined) => void
  allSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  notMadeSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  notCheckedSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
  checkedSearch: ReturnType<typeof useSearch<AssignedWorkEntity>>
}

const useAssignedWorkListStore = defineStore(
  'assigned-works:assigned-work-list',
  (): AssignedWorkListStore => {
    const userId = shallowRef<string>()

    const allSearch = useSearch(
      (pagination) => AssignedWorkService.get(pagination, userId.value),
      { immediate: false }
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

    function setUserId(id: string | undefined) {
      userId.value = id
    }

    return {
      setUserId,
      allSearch,
      notMadeSearch,
      notCheckedSearch,
      checkedSearch
    }
  }
)

export { useAssignedWorkListStore }
