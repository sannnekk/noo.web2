import { describe, expect, it } from 'vitest'
import { NooTubePermissions, nooTubePermissionPolicy } from './permissions'

describe('nootube permissions', () => {
  it('defines list access roles', () => {
    expect(
      nooTubePermissionPolicy.rolesFor(NooTubePermissions.viewListPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
  })
})
