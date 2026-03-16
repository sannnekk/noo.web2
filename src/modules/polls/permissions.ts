import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const PollsPermissions = {
  viewListPage: 'viewListPage',
  viewEditPage: 'viewEditPage'
} as const

type PollsPermission = (typeof PollsPermissions)[keyof typeof PollsPermissions]

const pollsPermissionMap: RolePermissionsMap<PollsPermission> = {
  [PollsPermissions.viewListPage]: ['admin', 'teacher', 'student'],
  [PollsPermissions.viewEditPage]: ['admin', 'teacher', 'student']
}

const pollsPermissionPolicy =
  createRolePermissionPolicy<PollsPermission>(pollsPermissionMap)

function usePollsPermissions(): {
  can: (permission: PollsPermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: PollsPermission): boolean {
    return pollsPermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { PollsPermission }
export { PollsPermissions, pollsPermissionPolicy, usePollsPermissions }
