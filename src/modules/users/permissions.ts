import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const UsersPermissions = {
  viewListPage: 'viewListPage',
  viewDetailPage: 'viewDetailPage',
  viewDangerZone: 'viewDangerZone',
  blockUser: 'blockUser',
  verifyUser: 'verifyUser',
  changeUserRole: 'changeUserRole',
  deleteUser: 'deleteUser',
  manageMentorAssignments: 'manageMentorAssignments',
  selfAssignAsMentor: 'selfAssignAsMentor',
  viewMentorAssignments: 'viewMentorAssignments'
} as const

type UsersPermission = (typeof UsersPermissions)[keyof typeof UsersPermissions]

const usersPermissionMap: RolePermissionsMap<UsersPermission> = {
  [UsersPermissions.viewListPage]: ['admin', 'teacher', 'assistant', 'mentor'],
  [UsersPermissions.viewDetailPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ],
  [UsersPermissions.viewDangerZone]: ['admin', 'teacher'],
  [UsersPermissions.blockUser]: ['admin', 'teacher'],
  [UsersPermissions.verifyUser]: ['admin', 'teacher'],
  [UsersPermissions.changeUserRole]: ['admin', 'teacher'],
  [UsersPermissions.deleteUser]: ['admin'],
  [UsersPermissions.manageMentorAssignments]: ['admin', 'teacher'],
  [UsersPermissions.selfAssignAsMentor]: ['admin', 'teacher', 'mentor'],
  [UsersPermissions.viewMentorAssignments]: [
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ]
}

const usersPermissionPolicy =
  createRolePermissionPolicy<UsersPermission>(usersPermissionMap)

function useUsersPermissions(): {
  can: (permission: UsersPermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: UsersPermission): boolean {
    return usersPermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { UsersPermission }
export { UsersPermissions, usersPermissionPolicy, useUsersPermissions }
