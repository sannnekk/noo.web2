import { definePermissions, roles } from '@/core/permissions/permission-policy'

const CoursePermissions = {
  viewListPage: 'viewListPage',
  viewDetailPage: 'viewDetailPage',
  viewStudentsPage: 'viewStudentsPage',
  viewEditPage: 'viewEditPage',
  viewOwnTab: 'viewOwnTab',
  viewArchivedTab: 'viewArchivedTab',
  createCourse: 'createCourse',
  manageCourse: 'manageCourse',
  viewCourseShop: 'viewCourseShop',
  useStudentOwnershipFilter: 'useStudentOwnershipFilter',
  solveWork: 'solveWork'
} as const

type CoursePermission =
  (typeof CoursePermissions)[keyof typeof CoursePermissions]

const coursePermissionPolicy = definePermissions({
  [CoursePermissions.viewListPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [CoursePermissions.viewDetailPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [CoursePermissions.viewStudentsPage]: roles('admin', 'teacher'),
  [CoursePermissions.viewEditPage]: roles('admin', 'teacher'),
  [CoursePermissions.viewOwnTab]: roles('teacher', 'student'),
  [CoursePermissions.viewArchivedTab]: roles('teacher', 'student'),
  [CoursePermissions.createCourse]: roles('admin', 'teacher'),
  [CoursePermissions.manageCourse]: roles('admin', 'teacher'),
  [CoursePermissions.viewCourseShop]: roles('student'),
  [CoursePermissions.useStudentOwnershipFilter]: roles('student'),
  [CoursePermissions.solveWork]: roles('student')
})

function useCoursePermissions(): Pick<
  typeof coursePermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: coursePermissionPolicy.can,
    cannot: coursePermissionPolicy.cannot
  }
}

export type { CoursePermission }
export { CoursePermissions, coursePermissionPolicy, useCoursePermissions }
