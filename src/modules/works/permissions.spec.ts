import { describe, expect, it } from 'vitest'
import { WorksPermissions, worksPermissionPolicy } from './permissions'

describe('works permissions', () => {
  it('defines list and edit access roles', () => {
    expect(
      worksPermissionPolicy.rolesFor(WorksPermissions.viewListPage)
    ).toEqual(['admin', 'teacher', 'student'])
    expect(
      worksPermissionPolicy.rolesFor(WorksPermissions.viewEditPage)
    ).toEqual(['admin', 'teacher', 'student'])
  })
})
