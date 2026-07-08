import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Principal } from '@/core/permissions/principal'

const mocks = vi.hoisted(() => ({
  principal: { current: null as Principal | null }
}))

vi.mock('@/core/permissions/principal', () => ({
  getPrincipal: () => mocks.principal.current,
  useCurrentPrincipal: () => ({ value: mocks.principal.current })
}))

import { courseListTabs } from './course-list-tabs'
import { coursePermissionPolicy } from './permissions'

function signInAs(principal: Principal | null): void {
  mocks.principal.current = principal
}

function visibleTabIds(): string[] {
  return courseListTabs
    .filter((tab) => coursePermissionPolicy.can(tab.permission))
    .map((tab) => tab.id)
}

beforeEach(() => {
  signInAs(null)
})

describe('course list tabs', () => {
  it.each([
    ['student', ['all', 'archived']],
    ['teacher', ['all', 'own', 'archived']],
    ['admin', ['all', 'archived']],
    ['assistant', ['all']],
    ['mentor', ['all']]
  ] as const)('shows the %s role the tabs: %j', (role, expectedTabIds) => {
    signInAs({ id: role, role })

    expect(visibleTabIds()).toEqual([...expectedTabIds])
  })

  it('never shows a role two tabs with the same id', () => {
    for (const role of [
      'admin',
      'teacher',
      'assistant',
      'mentor',
      'student'
    ] as const) {
      signInAs({ id: role, role })

      const tabIds = visibleTabIds()

      expect(new Set(tabIds).size).toBe(tabIds.length)
    }
  })

  it('shows no tabs when not authenticated', () => {
    expect(visibleTabIds()).toEqual([])
  })
})
