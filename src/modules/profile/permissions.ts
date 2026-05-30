import { definePermissions, roles } from '@/core/permissions/permission-policy'

const ProfilePermissions = {
  viewInfoTab: 'viewInfoTab',
  viewStatisticsTab: 'viewStatisticsTab',
  viewPollsTab: 'viewPollsTab',
  viewPaymentsTab: 'viewPaymentsTab'
} as const

type ProfilePermission =
  (typeof ProfilePermissions)[keyof typeof ProfilePermissions]

const profilePermissionPolicy = definePermissions({
  [ProfilePermissions.viewInfoTab]: roles('student', 'mentor'),
  [ProfilePermissions.viewStatisticsTab]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [ProfilePermissions.viewPollsTab]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [ProfilePermissions.viewPaymentsTab]: roles('student')
})

function useProfilePermissions(): Pick<
  typeof profilePermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: profilePermissionPolicy.can,
    cannot: profilePermissionPolicy.cannot
  }
}

export type { ProfilePermission }
export { ProfilePermissions, profilePermissionPolicy, useProfilePermissions }
