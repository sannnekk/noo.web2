import { describe, expect, it } from 'vitest'
import { HelpPermissions, helpPermissionPolicy } from './permissions'

describe('help permissions', () => {
  it('only allows admins and teachers to manage articles', () => {
    expect(
      helpPermissionPolicy.rolesFor(HelpPermissions.manageArticles)
    ).toEqual(['admin', 'teacher'])
  })

  it('only allows admins and teachers to manage the FAQ', () => {
    expect(helpPermissionPolicy.rolesFor(HelpPermissions.manageFaq)).toEqual([
      'admin',
      'teacher'
    ])
  })
})
