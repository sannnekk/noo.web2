import {
  createUsePermissions,
  definePermissions,
  roles,
  rule
} from '@/core/permissions/permission-policy'
import {
  targetHasRole,
  targetIsNotSelf,
  targetIsSelf,
  type TargetContext
} from '@/core/permissions/predicates'
import type { UserEntity } from './api/user.types'

const UsersPermissions = {
  viewListPage: 'viewListPage',
  viewDetailPage: 'viewDetailPage',
  viewCalendarTab: 'viewCalendarTab',
  viewPollsTab: 'viewPollsTab',
  viewAssignedWorksTab: 'viewAssignedWorksTab',
  viewHistoryTab: 'viewHistoryTab',
  viewStatisticsTab: 'viewStatisticsTab',
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
  [UsersPermissions.viewCalendarTab]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ),
  [UsersPermissions.viewPollsTab]: rule<UserContext>(['admin', 'teacher']),
  [UsersPermissions.viewAssignedWorksTab]: rule<UserContext>(
    ['admin', 'teacher', 'assistant', 'mentor'],
    targetHasRole('student', 'mentor')
  ),
  [UsersPermissions.viewHistoryTab]: roles('admin', 'teacher', 'assistant'),
  [UsersPermissions.viewStatisticsTab]: rule<UserContext>(
    ['admin', 'teacher', 'assistant', 'mentor']
    // If current user is a mentor, only allow if the target user is a student assigned to them
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

const useUsersPermissions = createUsePermissions(usersPermissionPolicy)

export type { UsersPermission }
export { UsersPermissions, usersPermissionPolicy, useUsersPermissions }
