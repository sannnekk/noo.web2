import { describe, expect, it } from 'vitest'
import { PollsPermissions, pollsPermissionPolicy } from './permissions'

describe('polls permissions', () => {
  it('defines list and edit access roles', () => {
    expect(
      pollsPermissionPolicy.rolesFor(PollsPermissions.viewListPage)
    ).toEqual(['admin', 'teacher', 'student'])
    expect(
      pollsPermissionPolicy.rolesFor(PollsPermissions.viewEditPage)
    ).toEqual(['admin', 'teacher', 'student'])
  })
})
