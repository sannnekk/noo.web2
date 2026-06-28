import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const AssignedWorksPermissions = {
  viewListPage: 'viewListPage',
  seeTaskCardsButton: 'seeTaskCardsButton',
  seeStatisticsButton: 'seeStatisticsButton',
  viewDetailPage: 'viewDetailPage',
  useStudentMode: 'useStudentMode',
  useMentorMode: 'useMentorMode',
  showStudentInfo: 'showStudentInfo',
  showMentorInfo: 'showMentorInfo',
  addHelperMentor: 'canAddHelperMentor',
  archive: 'canArchive'
} as const

type AssignedWorksPermission =
  (typeof AssignedWorksPermissions)[keyof typeof AssignedWorksPermissions]

const assignedWorksPermissionPolicy = definePermissions({
  [AssignedWorksPermissions.viewListPage]: roles('mentor', 'student'),
  [AssignedWorksPermissions.seeTaskCardsButton]: roles('student'),
  [AssignedWorksPermissions.seeStatisticsButton]: roles('student'),
  [AssignedWorksPermissions.viewDetailPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [AssignedWorksPermissions.useStudentMode]: roles('student'),
  [AssignedWorksPermissions.useMentorMode]: roles('mentor'),
  [AssignedWorksPermissions.showStudentInfo]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ),
  [AssignedWorksPermissions.showMentorInfo]: roles(
    'admin',
    'teacher',
    'assistant',
    'student'
  ),
  [AssignedWorksPermissions.addHelperMentor]: roles(
    'admin',
    'teacher',
    'mentor'
  ),
  [AssignedWorksPermissions.archive]: roles(
    'admin',
    'mentor',
    'assistant',
    'student'
  )
})

const useAssignedWorksPermissions = createUsePermissions(
  assignedWorksPermissionPolicy
)

export type { AssignedWorksPermission }
export {
  AssignedWorksPermissions,
  assignedWorksPermissionPolicy,
  useAssignedWorksPermissions
}
