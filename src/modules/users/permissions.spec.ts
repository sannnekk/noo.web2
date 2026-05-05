import { describe, expect, it } from 'vitest'
import { UsersPermissions, usersPermissionPolicy } from './permissions'

describe('users permissions', () => {
  it('defines list and detail access roles', () => {
    expect(
      usersPermissionPolicy.rolesFor(UsersPermissions.viewListPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor'])
    expect(
      usersPermissionPolicy.rolesFor(UsersPermissions.viewDetailPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor'])
  })

  it('restricts danger-zone actions to admins and teachers', () => {
    expect(
      usersPermissionPolicy.rolesFor(UsersPermissions.viewDangerZone)
    ).toEqual(['admin', 'teacher'])
    expect(usersPermissionPolicy.rolesFor(UsersPermissions.blockUser)).toEqual([
      'admin',
      'teacher'
    ])
    expect(usersPermissionPolicy.rolesFor(UsersPermissions.verifyUser)).toEqual(
      ['admin', 'teacher']
    )
    expect(
      usersPermissionPolicy.rolesFor(UsersPermissions.changeUserRole)
    ).toEqual(['admin', 'teacher'])
    expect(usersPermissionPolicy.rolesFor(UsersPermissions.deleteUser)).toEqual(
      ['admin']
    )
  })
})
