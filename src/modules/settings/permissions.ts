import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const SettingsPermissions = {
  manageAccountSettings: 'manageAccountSettings',
  manageTelegramSettings: 'manageTelegramSettings',
  managePaymentSettings: 'managePaymentSettings',
  managePersonalizationSettings: 'managePersonalizationSettings',
  manageNotifications: 'manageNotifications',
  manageGoogleSheets: 'manageGoogleSheets',
  manageSubjects: 'manageSubjects',
  viewChangelog: 'viewChangelog'
} as const

type SettingsPermission =
  (typeof SettingsPermissions)[keyof typeof SettingsPermissions]

const settingsPermissionMap: RolePermissionsMap<SettingsPermission> = {
  [SettingsPermissions.manageAccountSettings]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [SettingsPermissions.manageTelegramSettings]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [SettingsPermissions.managePaymentSettings]: ['student'],
  [SettingsPermissions.managePersonalizationSettings]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ],
  [SettingsPermissions.manageNotifications]: ['admin', 'teacher'],
  [SettingsPermissions.manageGoogleSheets]: ['admin', 'teacher'],
  [SettingsPermissions.manageSubjects]: ['admin'],
  [SettingsPermissions.viewChangelog]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ]
}

const settingsPermissionPolicy = createRolePermissionPolicy<SettingsPermission>(
  settingsPermissionMap
)

function useSettingsPermissions(): {
  can: (permission: SettingsPermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: SettingsPermission): boolean {
    return settingsPermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { SettingsPermission }
export { SettingsPermissions, settingsPermissionPolicy, useSettingsPermissions }
