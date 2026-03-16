import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const NooTubePermissions = {
  viewListPage: 'viewListPage'
} as const

type NooTubePermission =
  (typeof NooTubePermissions)[keyof typeof NooTubePermissions]

const nooTubePermissionMap: RolePermissionsMap<NooTubePermission> = {
  [NooTubePermissions.viewListPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ]
}

const nooTubePermissionPolicy =
  createRolePermissionPolicy<NooTubePermission>(nooTubePermissionMap)

function useNooTubePermissions(): {
  can: (permission: NooTubePermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: NooTubePermission): boolean {
    return nooTubePermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { NooTubePermission }
export { NooTubePermissions, nooTubePermissionPolicy, useNooTubePermissions }
