import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const HelpPermissions = {
  /** Create, edit and delete support articles. Reading is open to everyone. */
  manageArticles: 'manageArticles'
} as const

type HelpPermission = (typeof HelpPermissions)[keyof typeof HelpPermissions]

const helpPermissionPolicy = definePermissions({
  [HelpPermissions.manageArticles]: roles('admin', 'teacher')
})

const useHelpPermissions = createUsePermissions(helpPermissionPolicy)

export type { HelpPermission }
export { HelpPermissions, helpPermissionPolicy, useHelpPermissions }
