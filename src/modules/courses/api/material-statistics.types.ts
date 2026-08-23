import type { ApiEntity } from '@/core/api/api.types'
import type { MediaEntity } from '@/modules/media/api/media.types'
import type { UserEntity } from '@/modules/users/api/user.types'

/**
 * Download totals for one file attached to a course material. Files nobody has
 * downloaded are returned too, at zero.
 */
export interface MaterialFileDownloadSummary extends ApiEntity<'MaterialFileDownloadSummary'> {
  media: MediaEntity
  totalDownloads: number
  uniqueUsers: number
  lastDownloadAt: Date | null
}

/**
 * How often one user downloaded a material's files, and when they last did.
 */
export interface MaterialFileDownloader extends ApiEntity<'MaterialFileDownloader'> {
  userId: string
  user: UserEntity | null
  downloadCount: number
  firstDownloadAt: Date
  lastDownloadAt: Date
}
