import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Principal } from '@/core/permissions/principal'
import type { UserEntity } from './api/user.types'

const mocks = vi.hoisted(() => ({
  principal: { current: null as Principal | null }
}))

vi.mock('@/core/permissions/principal', () => ({
  getPrincipal: () => mocks.principal.current,
  useCurrentPrincipal: () => ({ value: mocks.principal.current })
}))

import { UsersPermissions, usersPermissionPolicy } from './permissions'

const { can, rolesFor } = usersPermissionPolicy

function asUser(id: string): UserEntity {
  return { id } as UserEntity
}

function signInAs(principal: Principal | null): void {
  mocks.principal.current = principal
}

beforeEach(() => {
  signInAs(null)
})

describe('users permissions — roles', () => {
  it('defines list and detail access roles', () => {
    expect(rolesFor(UsersPermissions.viewListPage)).toEqual([
      'admin',
      'teacher',
      'assistant',
      'mentor'
    ])
    expect(rolesFor(UsersPermissions.viewDetailPage)).toEqual([
      'admin',
      'teacher',
      'assistant',
      'mentor'
    ])
  })

  it('restricts danger-zone actions to admins and teachers', () => {
    expect(rolesFor(UsersPermissions.viewDangerZone)).toEqual([
      'admin',
      'teacher'
    ])
    expect(rolesFor(UsersPermissions.blockUser)).toEqual(['admin', 'teacher'])
    expect(rolesFor(UsersPermissions.verifyUser)).toEqual(['admin', 'teacher'])
    expect(rolesFor(UsersPermissions.changeUserRole)).toEqual([
      'admin',
      'teacher'
    ])
    expect(rolesFor(UsersPermissions.deleteUser)).toEqual(['admin'])
  })
})

describe('users permissions — relationships', () => {
  it('denies everything when not authenticated', () => {
    expect(can(UsersPermissions.viewListPage)).toBe(false)
    expect(can(UsersPermissions.blockUser, { target: asUser('other') })).toBe(
      false
    )
  })

  it('gates the list page by role', () => {
    signInAs({ id: 'a', role: 'admin' })
    expect(can(UsersPermissions.viewListPage)).toBe(true)

    signInAs({ id: 's', role: 'student' })
    expect(can(UsersPermissions.viewListPage)).toBe(false)
  })

  it('forbids destructive actions on your own account', () => {
    signInAs({ id: 'admin-1', role: 'admin' })

    expect(
      can(UsersPermissions.blockUser, { target: asUser('someone-else') })
    ).toBe(true)
    expect(can(UsersPermissions.blockUser, { target: asUser('admin-1') })).toBe(
      false
    )
    expect(
      can(UsersPermissions.deleteUser, { target: asUser('admin-1') })
    ).toBe(false)
  })

  it('denies relationship rules while the target is still loading', () => {
    signInAs({ id: 'admin-1', role: 'admin' })

    expect(can(UsersPermissions.viewDangerZone, { target: null })).toBe(false)
    expect(can(UsersPermissions.viewDangerZone, { target: undefined })).toBe(
      false
    )
  })

  it('lets a mentor manage students only on their own profile', () => {
    signInAs({ id: 'mentor-1', role: 'mentor' })

    expect(
      can(UsersPermissions.manageOwnStudents, { target: asUser('mentor-1') })
    ).toBe(true)
    expect(
      can(UsersPermissions.manageOwnStudents, { target: asUser('mentor-2') })
    ).toBe(false)

    signInAs({ id: 'teacher-1', role: 'teacher' })
    expect(
      can(UsersPermissions.manageOwnStudents, { target: asUser('teacher-1') })
    ).toBe(false)
  })

  it('only lets mentors self-assign as a mentor', () => {
    signInAs({ id: 'mentor-1', role: 'mentor' })
    expect(can(UsersPermissions.selfAssignAsMentor)).toBe(true)

    signInAs({ id: 'admin-1', role: 'admin' })
    expect(can(UsersPermissions.selfAssignAsMentor)).toBe(false)
  })
})
