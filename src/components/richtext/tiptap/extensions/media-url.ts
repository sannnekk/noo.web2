import { appConfig } from '@/core/config/app.config'

/**
 * Stable, embeddable URL for a media file. The backend 302-redirects this to a
 * freshly presigned download URL on every request, so the document only ever
 * stores the media id — never a short-lived presigned URL.
 */
export function mediaRawUrl(mediaId: string): string {
  return `${appConfig.apiUrl}/media/${mediaId}/raw`
}
