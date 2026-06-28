import {
  createUsePermissions,
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
  [NooTubePermissions.manageComment]: rule<CommentContext>(
    ['admin', 'teacher', 'assistant', 'mentor', 'student'],
    anyOf(principalHasRole('admin', 'teacher'), targetIsSelf)
  )
})

const useNooTubePermissions = createUsePermissions(nooTubePermissionPolicy)

export type { NooTubePermission }
export { NooTubePermissions, nooTubePermissionPolicy, useNooTubePermissions }
