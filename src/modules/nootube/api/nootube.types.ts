import type { ApiEntity } from '@/core/api/api.types'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { UserEntity } from '@/modules/users/api/user.types'

export type NooTubeServiceType = 'noo-tube' | 'you-tube' | 'vk-video' | 'rutube'

export type NooTubeVideoState =
  | 'not-uploaded'
  | 'uploading'
  | 'uploaded'
  | 'published'

export interface NooTubeVideoEntity extends ApiEntity<'NooTubeVideo'> {
  title: string
  description: string | null
  thumbnailId: string | null
  externalIdentifier: string | null
  externalUrl: string | null
  externalThumbnailUrl: string | null
  serviceType: NooTubeServiceType
  state: NooTubeVideoState
  duration: number | null
  publishedAt: Date
  uploadedByUserId: string
  uploadedByUser?: UserEntity
  thumbnail?: MediaEntity | null
}

export interface NooTubeVideoCommentEntity
  extends ApiEntity<'NooTubeVideoComment'> {
  videoId: string
  userId: string
  content: string
  video?: NooTubeVideoEntity
  user?: UserEntity
}
