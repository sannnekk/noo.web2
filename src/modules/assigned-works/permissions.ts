import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const AssignedWorksPermissions = {
  viewListPage: 'viewListPage',
  seeTaskCardsButton: 'seeTaskCardsButton',
  seeStatisticsButton: 'seeStatisticsButton',
  viewDetailPage: 'viewDetailPage',
  useStudentMode: 'useStudentMode',
  useMentorMode: 'useMentorMode',
  showStudentInfo: 'showStudentInfo',
  showMentorInfo: 'showMentorInfo',
  addHelperMentor: 'canAddHelperMentor',
  archive: 'canArchive'
} as const

type AssignedWorksPermission =
  (typeof AssignedWorksPermissions)[keyof typeof AssignedWorksPermissions]

const assignedWorksPermissionMap: RolePermissionsMap<AssignedWorksPermission> =
  {
    [AssignedWorksPermissions.viewListPage]: ['mentor', 'student'],
    [AssignedWorksPermissions.seeTaskCardsButton]: ['student'],
    [AssignedWorksPermissions.seeStatisticsButton]: ['student'],
    [AssignedWorksPermissions.viewDetailPage]: [
      'admin',
      'teacher',
      'assistant',
      'mentor',
      'student'
    ],
    [AssignedWorksPermissions.useStudentMode]: ['student'],
    [AssignedWorksPermissions.useMentorMode]: ['mentor'],
    [AssignedWorksPermissions.showStudentInfo]: [
      'admin',
      'teacher',
      'assistant',
      'mentor'
    ],
    [AssignedWorksPermissions.showMentorInfo]: [
      'admin',
      'teacher',
      'assistant',
      'student'
    ],
    [AssignedWorksPermissions.addHelperMentor]: ['admin', 'teacher', 'mentor'],
    [AssignedWorksPermissions.archive]: [
      'admin',
      'mentor',
      'assistant',
      'student'
    ]
  }

const assignedWorksPermissionPolicy =
  createRolePermissionPolicy<AssignedWorksPermission>(
    assignedWorksPermissionMap
  )

function useAssignedWorksPermissions(): {
  can: (permission: AssignedWorksPermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: AssignedWorksPermission): boolean {
    return assignedWorksPermissionPolicy.can(
      permission,
      authStore.userInfo?.role
    )
  }

  return {
    can
  }
}

export type { AssignedWorksPermission }
export {
  AssignedWorksPermissions,
  assignedWorksPermissionPolicy,
  useAssignedWorksPermissions
}
