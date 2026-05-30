import { definePermissions, roles } from '@/core/permissions/permission-policy'

const SettingsPermissions = {
  manageAccountSettings: 'manageAccountSettings',
  manageTelegramSettings: 'manageTelegramSettings',
  managePaymentSettings: 'managePaymentSettings',
  managePersonalizationSettings: 'managePersonalizationSettings',
  manageNotifications: 'manageNotifications',
  manageGoogleSheets: 'manageGoogleSheets',
  manageSubjects: 'manageSubjects',
  manageSnippets: 'manageSnippets',
  viewChangelog: 'viewChangelog'
} as const

type SettingsPermission =
  (typeof SettingsPermissions)[keyof typeof SettingsPermissions]

const settingsPermissionPolicy = definePermissions({
  [SettingsPermissions.manageAccountSettings]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [SettingsPermissions.manageTelegramSettings]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [SettingsPermissions.managePaymentSettings]: roles('student'),
  [SettingsPermissions.managePersonalizationSettings]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [SettingsPermissions.manageNotifications]: roles('admin', 'teacher'),
  [SettingsPermissions.manageGoogleSheets]: roles('admin', 'teacher'),
  [SettingsPermissions.manageSubjects]: roles('admin'),
  [SettingsPermissions.manageSnippets]: roles('mentor'),
  [SettingsPermissions.viewChangelog]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  )
})

function useSettingsPermissions(): Pick<
  typeof settingsPermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: settingsPermissionPolicy.can,
    cannot: settingsPermissionPolicy.cannot
  }
}

export type { SettingsPermission }
export { SettingsPermissions, settingsPermissionPolicy, useSettingsPermissions }
