import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const SettingsPermissions = {
  manageAccountSettings: 'manageAccountSettings',
  manageTelegramSettings: 'manageTelegramSettings',
  manageConnectedAccounts: 'manageConnectedAccounts',
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
  [SettingsPermissions.manageConnectedAccounts]: roles(
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
  // Mentors get in too, but only ever see and create the assigned-works export
  // for their own students — enforced by the backend profile, and mirrored in
  // the type list the create dialog offers.
  [SettingsPermissions.manageGoogleSheets]: roles('admin', 'teacher', 'mentor'),
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

const useSettingsPermissions = createUsePermissions(settingsPermissionPolicy)

export type { SettingsPermission }
export { SettingsPermissions, settingsPermissionPolicy, useSettingsPermissions }
