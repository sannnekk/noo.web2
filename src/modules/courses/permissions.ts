import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const CoursePermissions = {
  viewListPage: 'viewListPage',
  viewDetailPage: 'viewDetailPage',
  viewStudentsPage: 'viewStudentsPage',
  viewEditPage: 'viewEditPage',
  viewAllCoursesTab: 'viewAllCoursesTab',
  viewOwnCoursesTab: 'viewOwnCoursesTab',
  viewArchivedCoursesTab: 'viewArchivedCoursesTab',
  viewOwnMembershipsTab: 'viewOwnMembershipsTab',
  viewArchivedMembershipsTab: 'viewArchivedMembershipsTab',
  createCourse: 'createCourse',
  manageCourse: 'manageCourse',
  viewCourseShop: 'viewCourseShop',
  manageOwnCourseState: 'manageOwnCourseState',
  reactToMaterial: 'reactToMaterial',
  solveWork: 'solveWork',
  participateInPoll: 'participateInPoll',
  viewMaterialStatistics: 'viewMaterialStatistics'
} as const

type CoursePermission =
  (typeof CoursePermissions)[keyof typeof CoursePermissions]

const coursePermissionPolicy = definePermissions({
  [CoursePermissions.viewListPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [CoursePermissions.viewDetailPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [CoursePermissions.viewStudentsPage]: roles('admin', 'teacher'),
  [CoursePermissions.viewEditPage]: roles('admin', 'teacher'),
  [CoursePermissions.viewAllCoursesTab]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor'
  ),
  [CoursePermissions.viewOwnCoursesTab]: roles('teacher'),
  [CoursePermissions.viewArchivedCoursesTab]: roles('admin', 'teacher'),
  [CoursePermissions.viewOwnMembershipsTab]: roles('student'),
  [CoursePermissions.viewArchivedMembershipsTab]: roles('student'),
  [CoursePermissions.createCourse]: roles('admin', 'teacher'),
  [CoursePermissions.manageCourse]: roles('admin', 'teacher'),
  [CoursePermissions.viewCourseShop]: roles('student'),
  [CoursePermissions.manageOwnCourseState]: roles('student'),
  [CoursePermissions.reactToMaterial]: roles('student'),
  [CoursePermissions.solveWork]: roles('student'),
  [CoursePermissions.participateInPoll]: roles(
    'assistant',
    'mentor',
    'student'
  ),
  [CoursePermissions.viewMaterialStatistics]: roles(
    'admin',
    'teacher',
    'assistant'
  )
})

const useCoursePermissions = createUsePermissions(coursePermissionPolicy)

export type { CoursePermission }
export { CoursePermissions, coursePermissionPolicy, useCoursePermissions }
