import { createPinia, setActivePinia } from 'pinia'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock
} from 'vitest'
import type { AssignedWorkTabQuery } from '../api/assigned-work.types'
import type { AssignedWorkListTab } from '../types'

vi.mock('@/core/stores/auth.store', () => ({
  useAuthStore: () => ({ userId: 'user-1' })
}))

vi.mock('../api/assigned-work.service', () => ({
  AssignedWorkService: {
    get: vi.fn(),
    getMetadata: vi.fn()
  }
}))

import { AssignedWorkService } from '../api/assigned-work.service'
import { useAssignedWorkListStore } from './assigned-work-list.store'

const SEARCH_DEBOUNCE_MS = 500

/**
 * Deliberately all different, so a tab that takes its counter from another slice of the
 * list cannot pass.
 */
const counts = { all: 10, notSolved: 4, notChecked: 3, checked: 2 }

/**
 * What every tab of the list page stands for: the slice it asks the API for, and the
 * counter it puts next to its title. Both have to describe the same set of works, or the
 * page shows a number that disagrees with the rows below it.
 */
const tabs: {
  tab: AssignedWorkListTab
  apiTab: AssignedWorkTabQuery
  counter: number
}[] = [
  { tab: 'all', apiTab: 'all', counter: counts.all },
  { tab: 'not-made', apiTab: 'not-solved', counter: counts.notSolved },
  { tab: 'not-checked', apiTab: 'not-checked', counter: counts.notChecked },
  { tab: 'checked', apiTab: 'checked', counter: counts.checked }
]

async function flushSearch() {
  await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS + 50)
  await vi.runAllTimersAsync()
}

function tabsRequested(): (string | null)[] {
  return (AssignedWorkService.get as Mock).mock.calls.map(([pagination]) =>
    pagination.toQuery().get('Tab')
  )
}

describe('useAssignedWorkListStore — tabs', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    ;(AssignedWorkService.get as Mock).mockResolvedValue({
      data: [],
      meta: { total: 0 }
    })
    ;(AssignedWorkService.getMetadata as Mock).mockResolvedValue({
      data: { counts }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('each tab counter reports the slice of the list that tab shows', async () => {
    const store = useAssignedWorkListStore()

    await store.metadata.execute()

    for (const { tab, counter } of tabs) {
      expect(store.counts[tab]).toBe(counter)
    }
  })

  test('counters are absent until the metadata is loaded', () => {
    const store = useAssignedWorkListStore()

    for (const { tab } of tabs) {
      expect(store.counts[tab]).toBeUndefined()
    }
  })

  test.each(tabs)(
    'the "$tab" tab lists the "$apiTab" slice — the one its counter counts',
    async ({ tab, apiTab }) => {
      const store = useAssignedWorkListStore()

      // The "all" tab loads on its own; let it settle before watching for the tab.
      await flushSearch()
      ;(AssignedWorkService.get as Mock).mockClear()

      store.onTabChange(tab)
      await flushSearch()

      expect(tabsRequested()).toEqual([apiTab])
    }
  )

  test('a tab already loaded is not requested again', async () => {
    ;(AssignedWorkService.get as Mock).mockResolvedValue({
      data: [{ id: 'aw-1' }],
      meta: { total: 1 }
    })

    const store = useAssignedWorkListStore()

    store.onTabChange('checked')
    await flushSearch()
    ;(AssignedWorkService.get as Mock).mockClear()

    store.onTabChange('checked')
    await flushSearch()

    expect(AssignedWorkService.get).not.toHaveBeenCalled()
  })
})
