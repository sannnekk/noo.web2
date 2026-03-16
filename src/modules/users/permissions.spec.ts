import { describe, expect, it } from 'vitest'
import { UsersPermissions, usersPermissionPolicy } from './permissions'

describe('users permissions', () => {
  it('defines list and detail access roles', () => {
    expect(
      usersPermissionPolicy.rolesFor(UsersPermissions.viewListPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
    expect(
      usersPermissionPolicy.rolesFor(UsersPermissions.viewDetailPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
  })
})
