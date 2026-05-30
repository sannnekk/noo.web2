import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Principal } from '@/core/permissions/principal'

const mocks = vi.hoisted(() => ({
  principal: { current: null as Principal | null }
}))

vi.mock('@/core/permissions/principal', () => ({
  getPrincipal: () => mocks.principal.current,
  useCurrentPrincipal: () => ({ value: mocks.principal.current })
}))

import {
  AssignedWorksPermissions,
  assignedWorksPermissionPolicy
} from './permissions'

const { can, rolesFor } = assignedWorksPermissionPolicy

function signInAs(principal: Principal | null): void {
  mocks.principal.current = principal
}

beforeEach(() => {
  signInAs(null)
})

describe('assigned works permissions', () => {
  it('defines list route access for student and mentor only, detail for all routes', () => {
    expect(rolesFor(AssignedWorksPermissions.viewListPage)).toEqual([
      'mentor',
      'student'
    ])
    expect(rolesFor(AssignedWorksPermissions.viewDetailPage)).toEqual([
      'admin',
      'teacher',
      'assistant',
      'mentor',
      'student'
    ])
  })

  it('defines student and mentor mode permissions', () => {
    signInAs({ id: 's', role: 'student' })
    expect(can(AssignedWorksPermissions.useStudentMode)).toBe(true)
    expect(can(AssignedWorksPermissions.useMentorMode)).toBe(false)

    signInAs({ id: 'm', role: 'mentor' })
    expect(can(AssignedWorksPermissions.useStudentMode)).toBe(false)
    expect(can(AssignedWorksPermissions.useMentorMode)).toBe(true)
  })
})
