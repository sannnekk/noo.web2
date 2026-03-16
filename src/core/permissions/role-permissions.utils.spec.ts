import { describe, expect, it } from 'vitest'
import { createRolePermissionPolicy } from './role-permissions.utils'

type TestPermission = 'read' | 'write'

describe('createRolePermissionPolicy', () => {
  it('checks role access by permission', () => {
    const policy = createRolePermissionPolicy<TestPermission>({
      read: ['student', 'teacher'],
      write: ['teacher']
    })

    expect(policy.can('read', 'student')).toBe(true)
    expect(policy.can('read', 'teacher')).toBe(true)
    expect(policy.can('read', 'admin')).toBe(false)
    expect(policy.can('write', 'teacher')).toBe(true)
    expect(policy.can('write', 'student')).toBe(false)
  })

  it('denies access when role is missing', () => {
    const policy = createRolePermissionPolicy<TestPermission>({
      read: ['student'],
      write: ['teacher']
    })

    expect(policy.can('read')).toBe(false)
    expect(policy.can('write')).toBe(false)
  })

  it('returns a copy of allowed roles', () => {
    const policy = createRolePermissionPolicy<TestPermission>({
      read: ['student', 'teacher'],
      write: ['teacher']
    })

    const roles = policy.rolesFor('read')
    roles.pop()

    expect(policy.rolesFor('read')).toEqual(['student', 'teacher'])
  })
})
