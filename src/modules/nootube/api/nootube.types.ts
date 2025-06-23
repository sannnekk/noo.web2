import type { ApiEntity } from '@/core/api/api.types'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { UserEntity } from '@/modules/users/api/user.types'

export type NooTubeServiceType = 'noo-tube' | 'youtube' | 'vk-video' | 'rutube'

export type NooTubeVideoState =
  | 'not-uploaded'
  | 'uploading'
  | 'uploaded'
  | 'published'

export interface NooTubeVideoEntity extends ApiEntity {
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
  uploadedById: string | null
  uploadedBy?: UserEntity
  thumbnail?: MediaEntity | null
}

export interface NooTubeVideoCommentEntity extends ApiEntity {
  videoId: string
  userId: string
  content: string
  video?: NooTubeVideoEntity
  user?: UserEntity
}
