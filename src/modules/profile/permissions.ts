import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const ProfilePermissions = {
  viewInfoTab: 'viewInfoTab',
  viewStatisticsTab: 'viewStatisticsTab',
  viewPollsTab: 'viewPollsTab',
  viewPaymentsTab: 'viewPaymentsTab'
} as const

type ProfilePermission =
  (typeof ProfilePermissions)[keyof typeof ProfilePermissions]

const profilePermissionMap: RolePermissionsMap<ProfilePermission> = {
  [ProfilePermissions.viewInfoTab]: ['student', 'mentor'],
  [ProfilePermissions.viewStatisticsTab]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [ProfilePermissions.viewPollsTab]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [ProfilePermissions.viewPaymentsTab]: ['student']
}

const profilePermissionPolicy =
  createRolePermissionPolicy<ProfilePermission>(profilePermissionMap)

function useProfilePermissions(): {
  can: (permission: ProfilePermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: ProfilePermission): boolean {
    return profilePermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { ProfilePermission }
export { ProfilePermissions, profilePermissionPolicy, useProfilePermissions }
