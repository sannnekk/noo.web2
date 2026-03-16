import { describe, expect, it } from 'vitest'
import {
  AssignedWorksPermissions,
  assignedWorksPermissionPolicy
} from './permissions'

describe('assigned works permissions', () => {
  it('defines route access for all roles', () => {
    expect(
      assignedWorksPermissionPolicy.rolesFor(
        AssignedWorksPermissions.viewListPage
      )
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
    expect(
      assignedWorksPermissionPolicy.rolesFor(
        AssignedWorksPermissions.viewDetailPage
      )
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
  })

  it('defines student and mentor mode permissions', () => {
    expect(
      assignedWorksPermissionPolicy.can(
        AssignedWorksPermissions.useStudentMode,
        'student'
      )
    ).toBe(true)
    expect(
      assignedWorksPermissionPolicy.can(
        AssignedWorksPermissions.useStudentMode,
        'mentor'
      )
    ).toBe(false)
    expect(
      assignedWorksPermissionPolicy.can(
        AssignedWorksPermissions.useMentorMode,
        'mentor'
      )
    ).toBe(true)
  })
})
