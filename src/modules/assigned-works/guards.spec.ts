import { describe, expect, test } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { assignedWorkListTabGuard } from './guards'
import { assignedWorkListTabs } from './types'

const at = (tab: string) =>
  ({ params: { tab } }) as unknown as RouteLocationNormalized

const toAllTab = { name: 'assigned-works.list', params: { tab: 'all' } }

describe('assignedWorkListTabGuard', () => {
  test.each(assignedWorkListTabs)('lets %s through', (tab) => {
    expect(assignedWorkListTabGuard(at(tab))).toBe(true)
  })

  // The guard used to carry its own list of tab names, which had drifted away
  // from the ones the page renders — two of the four tabs bounced to "all".
  test.each(['my', 'solved', 'not-solved', ''])(
    'sends %s, which the page does not render, back to the first tab',
    (tab) => {
      expect(assignedWorkListTabGuard(at(tab))).toEqual(toAllTab)
    }
  )
})
