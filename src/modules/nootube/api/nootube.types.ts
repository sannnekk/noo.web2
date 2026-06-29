import type { ApiEntity } from '@/core/api/api.types'
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { UserEntity } from '@/modules/users/api/user.types'

export type NooTubeServiceType = 'kinescope'

export type NooTubeVideoState =
  | 'not-uploaded'
  | 'uploading'
  | 'encoding'
  | 'uploaded'
  | 'published'

export type VideoReaction =
  | 'like'
  | 'dislike'
  | 'heart'
  | 'laugh'
  | 'sad'
  | 'mindblowing'

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
  isListed: boolean
  isFavourite: boolean
  publishedAt: Date
  uploadedByUserId: string
  uploadedByUser?: UserEntity | null
  thumbnail?: MediaEntity | null
  comments?: NooTubeVideoCommentEntity[]
}

export interface NooTubeVideoCommentEntity extends ApiEntity<'NooTubeVideoComment'> {
  userId: string
  content: string
  user?: UserEntity | null
}

/**
 * A single day of playback statistics for a video.
 */
export interface NooTubeVideoStatisticsPoint {
  date: Date
  views: number
  uniqueViews: number
  watchTimeSeconds: number
  playerLoads: number
}

/**
 * Aggregated playback statistics for a video over a period, together with a
 * per-day timeline.
 */
export interface NooTubeVideoStatistics {
  from: Date
  to: Date
  views: number
  uniqueViews: number
  watchTimeSeconds: number
  playerLoads: number
  timeline: NooTubeVideoStatisticsPoint[]
}

/**
 * Result of initializing a video upload. Contains the upload URL the client
 * should stream the file to (e.g. a tus endpoint).
 */
export interface NooTubeVideoUpload {
  videoId: string
  uploadUrl: string
  externalId: string
}

export type PossiblyUnsavedNooTubeVideo = PossiblyUnsavedEntity<
  NooTubeVideoEntity,
  NooTubeVideoEntity['_entityName']
>

export type PossiblyUnsavedNooTubeVideoComment = PossiblyUnsavedEntity<
  NooTubeVideoCommentEntity,
  NooTubeVideoCommentEntity['_entityName']
>

/**
 * Payload to create a video and initialize its upload. Combines the local
 * video draft with the upload metadata required by the video engine.
 */
export type CreateNooTubeVideoPayload = PossiblyUnsavedNooTubeVideo & {
  fileSize: number
  fileName?: string | null
}
