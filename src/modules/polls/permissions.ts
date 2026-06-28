import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const PollsPermissions = {
  viewListPage: 'viewListPage',
  viewEditPage: 'viewEditPage',
  viewResultsPage: 'viewResultsPage',
  deletePoll: 'deletePoll'
} as const

type PollsPermission = (typeof PollsPermissions)[keyof typeof PollsPermissions]

const pollsPermissionPolicy = definePermissions({
  [PollsPermissions.viewListPage]: roles('admin', 'teacher', 'student'),
  [PollsPermissions.viewEditPage]: roles('admin', 'teacher', 'student'),
  [PollsPermissions.viewResultsPage]: roles('admin', 'teacher'),
  [PollsPermissions.deletePoll]: roles('admin', 'teacher')
})

const usePollsPermissions = createUsePermissions(pollsPermissionPolicy)

export type { PollsPermission }
export { PollsPermissions, pollsPermissionPolicy, usePollsPermissions }
