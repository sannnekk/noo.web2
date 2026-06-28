import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const WorksPermissions = {
  viewListPage: 'viewListPage',
  viewEditPage: 'viewEditPage'
} as const

type WorksPermission = (typeof WorksPermissions)[keyof typeof WorksPermissions]

const worksPermissionPolicy = definePermissions({
  [WorksPermissions.viewListPage]: roles('admin', 'teacher', 'student'),
  [WorksPermissions.viewEditPage]: roles('admin', 'teacher', 'student')
})

const useWorksPermissions = createUsePermissions(worksPermissionPolicy)

export type { WorksPermission }
export { WorksPermissions, worksPermissionPolicy, useWorksPermissions }
