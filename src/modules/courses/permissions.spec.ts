import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Principal } from '@/core/permissions/principal'

const mocks = vi.hoisted(() => ({
  principal: { current: null as Principal | null }
}))

vi.mock('@/core/permissions/principal', () => ({
  getPrincipal: () => mocks.principal.current,
  useCurrentPrincipal: () => ({ value: mocks.principal.current })
}))

import { CoursePermissions, coursePermissionPolicy } from './permissions'

const { can, rolesFor } = coursePermissionPolicy

function signInAs(principal: Principal | null): void {
  mocks.principal.current = principal
}

beforeEach(() => {
  signInAs(null)
})

describe('courses permissions', () => {
  it('defines route roles from permission map', () => {
    expect(rolesFor(CoursePermissions.viewListPage)).toEqual([
      'admin',
      'teacher',
      'assistant',
      'mentor',
      'student'
    ])
    expect(rolesFor(CoursePermissions.viewEditPage)).toEqual([
      'admin',
      'teacher'
    ])
    expect(rolesFor(CoursePermissions.viewStudentsPage)).toEqual([
      'admin',
      'teacher'
    ])
  })

  it('supports student-only and manager-only permissions', () => {
    signInAs({ id: 's', role: 'student' })
    expect(can(CoursePermissions.viewCourseShop)).toBe(true)
    expect(can(CoursePermissions.manageCourse)).toBe(false)

    signInAs({ id: 't', role: 'teacher' })
    expect(can(CoursePermissions.viewCourseShop)).toBe(false)

    signInAs({ id: 'a', role: 'admin' })
    expect(can(CoursePermissions.manageCourse)).toBe(true)
  })

  it('shows students only the membership tabs', () => {
    signInAs({ id: 's', role: 'student' })
    expect(can(CoursePermissions.viewOwnMembershipsTab)).toBe(true)
    expect(can(CoursePermissions.viewArchivedMembershipsTab)).toBe(true)
    expect(can(CoursePermissions.viewAllCoursesTab)).toBe(false)
    expect(can(CoursePermissions.viewOwnCoursesTab)).toBe(false)
    expect(can(CoursePermissions.viewArchivedCoursesTab)).toBe(false)
  })

  it('shows teachers the all, own and archived course tabs', () => {
    signInAs({ id: 't', role: 'teacher' })
    expect(can(CoursePermissions.viewAllCoursesTab)).toBe(true)
    expect(can(CoursePermissions.viewOwnCoursesTab)).toBe(true)
    expect(can(CoursePermissions.viewArchivedCoursesTab)).toBe(true)
    expect(can(CoursePermissions.viewOwnMembershipsTab)).toBe(false)
    expect(can(CoursePermissions.viewArchivedMembershipsTab)).toBe(false)
  })

  it('shows admins the all and archived course tabs', () => {
    signInAs({ id: 'a', role: 'admin' })
    expect(can(CoursePermissions.viewAllCoursesTab)).toBe(true)
    expect(can(CoursePermissions.viewOwnCoursesTab)).toBe(false)
    expect(can(CoursePermissions.viewArchivedCoursesTab)).toBe(true)
    expect(can(CoursePermissions.viewOwnMembershipsTab)).toBe(false)
    expect(can(CoursePermissions.viewArchivedMembershipsTab)).toBe(false)
  })

  it('shows assistants and mentors only the all courses tab', () => {
    for (const role of ['assistant', 'mentor'] as const) {
      signInAs({ id: role, role })
      expect(can(CoursePermissions.viewAllCoursesTab)).toBe(true)
      expect(can(CoursePermissions.viewOwnCoursesTab)).toBe(false)
      expect(can(CoursePermissions.viewArchivedCoursesTab)).toBe(false)
      expect(can(CoursePermissions.viewOwnMembershipsTab)).toBe(false)
      expect(can(CoursePermissions.viewArchivedMembershipsTab)).toBe(false)
    }
  })

  it('denies access when not authenticated', () => {
    expect(can(CoursePermissions.viewOwnMembershipsTab)).toBe(false)
  })
})
