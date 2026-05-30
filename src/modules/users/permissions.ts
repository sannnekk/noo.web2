import {
  definePermissions,
  roles,
  rule
} from '@/core/permissions/permission-policy'
import {
  targetIsNotSelf,
  targetIsSelf,
  type TargetContext
} from '@/core/permissions/predicates'
import type { UserEntity } from './api/user.types'

const UsersPermissions = {
  viewListPage: 'viewListPage',
  viewDetailPage: 'viewDetailPage',
  viewDangerZone: 'viewDangerZone',
  blockUser: 'blockUser',
  verifyUser: 'verifyUser',
  changeUserRole: 'changeUserRole',
  deleteUser: 'deleteUser',
  manageMentorAssignments: 'manageMentorAssignments',
  selfAssignAsMentor: 'selfAssignAsMentor',
  manageOwnStudents: 'manageOwnStudents',
  viewMentorAssignments: 'viewMentorAssignments',
  manageCourseMemberships: 'manageCourseMemberships'
} as const

type UsersPermission = (typeof UsersPermissions)[keyof typeof UsersPermissions]

/** Context for rules acting on a single user (the one being viewed). */
type UserContext = TargetContext<UserEntity>

const usersPermissionPolicy = definePermissions({
  [UsersPermissions.viewListPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ),
  [UsersPermissions.viewDetailPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ),
  // Destructive/administrative actions: never on your own account.
  [UsersPermissions.viewDangerZone]: rule<UserContext>(
    ['admin', 'teacher'],
    targetIsNotSelf
  ),
  [UsersPermissions.blockUser]: rule<UserContext>(
    ['admin', 'teacher'],
    targetIsNotSelf
  ),
  [UsersPermissions.verifyUser]: rule<UserContext>(
    ['admin', 'teacher'],
    targetIsNotSelf
  ),
  [UsersPermissions.changeUserRole]: rule<UserContext>(
    ['admin', 'teacher'],
    targetIsNotSelf
  ),
  [UsersPermissions.deleteUser]: rule<UserContext>(['admin'], targetIsNotSelf),
  [UsersPermissions.manageMentorAssignments]: roles('admin', 'teacher'),
  // A mentor adding themselves as a mentor to the student being viewed.
  [UsersPermissions.selfAssignAsMentor]: roles('mentor'),
  // A mentor managing the students attached to their own profile.
  [UsersPermissions.manageOwnStudents]: rule<UserContext>(
    ['mentor'],
    targetIsSelf
  ),
  [UsersPermissions.viewMentorAssignments]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ),
  [UsersPermissions.manageCourseMemberships]: roles('admin', 'teacher')
})

function useUsersPermissions(): Pick<
  typeof usersPermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: usersPermissionPolicy.can,
    cannot: usersPermissionPolicy.cannot
  }
}

export type { UsersPermission }
export { UsersPermissions, usersPermissionPolicy, useUsersPermissions }
