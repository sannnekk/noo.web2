import { definePermissions, roles } from '@/core/permissions/permission-policy'

const NooTubePermissions = {
  viewListTab: 'viewListTab',
  viewFavoritesTab: 'viewFavoritesTab',
  viewOwnVideosTab: 'viewVideoTab',
  createVideo: 'createVideo'
} as const

type NooTubePermission =
  (typeof NooTubePermissions)[keyof typeof NooTubePermissions]

const nooTubePermissionPolicy = definePermissions({
  [NooTubePermissions.viewListTab]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [NooTubePermissions.viewFavoritesTab]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ),
  [NooTubePermissions.viewOwnVideosTab]: roles('teacher'),
  [NooTubePermissions.createVideo]: roles('teacher')
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
