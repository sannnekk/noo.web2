import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

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
  useStudentOwnershipFilter: 'useStudentOwnershipFilter'
} as const

type CoursePermission =
  (typeof CoursePermissions)[keyof typeof CoursePermissions]

const coursePermissionMap: RolePermissionsMap<CoursePermission> = {
  [CoursePermissions.viewListPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [CoursePermissions.viewDetailPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [CoursePermissions.viewStudentsPage]: ['admin', 'teacher'],
  [CoursePermissions.viewEditPage]: ['admin', 'teacher'],
  [CoursePermissions.viewOwnTab]: ['teacher', 'student'],
  [CoursePermissions.viewArchivedTab]: ['teacher', 'student'],
  [CoursePermissions.createCourse]: ['admin', 'teacher'],
  [CoursePermissions.manageCourse]: ['admin', 'teacher'],
  [CoursePermissions.viewCourseShop]: ['student'],
  [CoursePermissions.useStudentOwnershipFilter]: ['student']
}

const coursePermissionPolicy =
  createRolePermissionPolicy<CoursePermission>(coursePermissionMap)

function useCoursePermissions(): {
  can: (permission: CoursePermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: CoursePermission): boolean {
    return coursePermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { CoursePermission }
export { CoursePermissions, coursePermissionPolicy, useCoursePermissions }
