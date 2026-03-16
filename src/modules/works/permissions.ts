import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const WorksPermissions = {
  viewListPage: 'viewListPage',
  viewEditPage: 'viewEditPage'
} as const

type WorksPermission = (typeof WorksPermissions)[keyof typeof WorksPermissions]

const worksPermissionMap: RolePermissionsMap<WorksPermission> = {
  [WorksPermissions.viewListPage]: ['admin', 'teacher', 'student'],
  [WorksPermissions.viewEditPage]: ['admin', 'teacher', 'student']
}

const worksPermissionPolicy =
  createRolePermissionPolicy<WorksPermission>(worksPermissionMap)

function useWorksPermissions(): {
  can: (permission: WorksPermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: WorksPermission): boolean {
    return worksPermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { WorksPermission }
export { WorksPermissions, worksPermissionPolicy, useWorksPermissions }
