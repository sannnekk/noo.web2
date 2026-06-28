import {
  definePermissions,
  roles,
  rule
} from '@/core/permissions/permission-policy'
import {
  anyOf,
  principalHasRole,
  targetIsSelf,
  type TargetContext
} from '@/core/permissions/predicates'

const NooTubePermissions = {
  viewListTab: 'viewListTab',
  viewFavoritesTab: 'viewFavoritesTab',
  viewOwnVideosTab: 'viewVideoTab',
  createVideo: 'createVideo',
  editVideo: 'editVideo',
  deleteVideo: 'deleteVideo',
  manageComment: 'manageComment'
} as const

/** Context for rules acting on a single comment (its author). */
type CommentContext = TargetContext<{ id: string }>

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
  [NooTubePermissions.createVideo]: roles('teacher'),
  [NooTubePermissions.editVideo]: roles('admin', 'teacher'),
  [NooTubePermissions.deleteVideo]: roles('admin', 'teacher'),
  // Teachers and admins can manage any comment; everyone else only their own.
  [NooTubePermissions.manageComment]: rule<CommentContext>(
    ['admin', 'teacher', 'assistant', 'mentor', 'student'],
    anyOf(principalHasRole('admin', 'teacher'), targetIsSelf)
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
