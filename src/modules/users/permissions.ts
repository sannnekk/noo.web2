import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const UsersPermissions = {
  viewListPage: 'viewListPage',
  viewDetailPage: 'viewDetailPage'
} as const

type UsersPermission = (typeof UsersPermissions)[keyof typeof UsersPermissions]

const usersPermissionMap: RolePermissionsMap<UsersPermission> = {
  [UsersPermissions.viewListPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [UsersPermissions.viewDetailPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
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
