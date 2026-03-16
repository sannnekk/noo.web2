import { describe, expect, it } from 'vitest'
import { CoursePermissions, coursePermissionPolicy } from './permissions'

describe('courses permissions', () => {
  it('defines route roles from permission map', () => {
    expect(
      coursePermissionPolicy.rolesFor(CoursePermissions.viewListPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
    expect(
      coursePermissionPolicy.rolesFor(CoursePermissions.viewEditPage)
    ).toEqual(['admin', 'teacher'])
    expect(
      coursePermissionPolicy.rolesFor(CoursePermissions.viewStudentsPage)
    ).toEqual(['admin', 'teacher'])
  })

  it('supports student-only and manager-only permissions', () => {
    expect(
      coursePermissionPolicy.can(CoursePermissions.viewCourseShop, 'student')
    ).toBe(true)
    expect(
      coursePermissionPolicy.can(CoursePermissions.viewCourseShop, 'teacher')
    ).toBe(false)
    expect(
      coursePermissionPolicy.can(CoursePermissions.manageCourse, 'admin')
    ).toBe(true)
    expect(
      coursePermissionPolicy.can(CoursePermissions.manageCourse, 'student')
    ).toBe(false)
  })

  it('denies access when role is missing', () => {
    expect(coursePermissionPolicy.can(CoursePermissions.viewOwnTab)).toBe(false)
  })
})
