import { definePermissions, roles } from '@/core/permissions/permission-policy'

const PollsPermissions = {
  viewListPage: 'viewListPage',
  viewEditPage: 'viewEditPage'
} as const

type PollsPermission = (typeof PollsPermissions)[keyof typeof PollsPermissions]

const pollsPermissionPolicy = definePermissions({
  [PollsPermissions.viewListPage]: roles('admin', 'teacher', 'student'),
  [PollsPermissions.viewEditPage]: roles('admin', 'teacher', 'student')
})

function usePollsPermissions(): Pick<
  typeof pollsPermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: pollsPermissionPolicy.can,
    cannot: pollsPermissionPolicy.cannot
  }
}

export type { PollsPermission }
export { PollsPermissions, pollsPermissionPolicy, usePollsPermissions }
