import type { ApiEntity } from '@/core/api/api.types'

export type MediaStatus = 'pending' | 'completed'

export type MediaCategory =
  | 'user-avatar'
  | 'video-cover'
  | 'video-rich-text'
  | 'course-cover'
  | 'course-attachment'
  | 'course-rich-text'
  | 'work-rich-text'
  | 'profile-background'
  | 'assigned-work-student-rich-text'
  | 'assigned-work-mentor-rich-text'
  | 'assigned-work-student-comment-rich-text'
  | 'assigned-work-mentor-comment-rich-text'
  | 'help-rich-text'
  | 'snippet-rich-text'

export interface MediaEntity extends ApiEntity<'Media'> {
  order: number
  path: string
  name: string
  actualName: string | null
  extension: string
  size: number
  category: MediaCategory
  status: MediaStatus
  url: string
  entityId?: string
  ownerId?: string
}

export interface RequestUploadPayload {
  category: MediaCategory
  fileName: string
  contentType: string
  entityId?: string
}

export interface UploadTicket {
  mediaId: string
  uploadUrl: string
  headers: Record<string, string>
  expiresAt: Date
}

export interface CompleteUploadPayload {
  size: number
  etag?: string | null
}

export interface DownloadUrl {
  url: string
}
