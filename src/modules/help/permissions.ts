import { definePermissions, roles } from '@/core/permissions/permission-policy'

const HelpPermissions = {
  /** Create, edit and delete support articles. Reading is open to everyone. */
  manageArticles: 'manageArticles'
} as const

type HelpPermission = (typeof HelpPermissions)[keyof typeof HelpPermissions]

const helpPermissionPolicy = definePermissions({
  [HelpPermissions.manageArticles]: roles('admin', 'teacher')
})

function useHelpPermissions(): Pick<
  typeof helpPermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: helpPermissionPolicy.can,
    cannot: helpPermissionPolicy.cannot
  }
}

export type { HelpPermission }
export { HelpPermissions, helpPermissionPolicy, useHelpPermissions }
