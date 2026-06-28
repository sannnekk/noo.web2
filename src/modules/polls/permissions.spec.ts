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

  it('restricts results and deletion to admins and teachers', () => {
    expect(
      pollsPermissionPolicy.rolesFor(PollsPermissions.viewResultsPage)
    ).toEqual(['admin', 'teacher'])
    expect(pollsPermissionPolicy.rolesFor(PollsPermissions.deletePoll)).toEqual(
      ['admin', 'teacher']
    )
  })
})
