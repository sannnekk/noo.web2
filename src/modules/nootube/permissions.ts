import { definePermissions, roles } from '@/core/permissions/permission-policy'

const NooTubePermissions = {
  viewListPage: 'viewListPage'
} as const

type NooTubePermission =
  (typeof NooTubePermissions)[keyof typeof NooTubePermissions]

const nooTubePermissionPolicy = definePermissions({
  [NooTubePermissions.viewListPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  )
})

function useNooTubePermissions(): Pick<
  typeof nooTubePermissionPolicy,
  'can' | 'cannot'
> {
  return {
    can: nooTubePermissionPolicy.can,
    cannot: nooTubePermissionPolicy.cannot
  }
}

export type { NooTubePermission }
export { NooTubePermissions, nooTubePermissionPolicy, useNooTubePermissions }
