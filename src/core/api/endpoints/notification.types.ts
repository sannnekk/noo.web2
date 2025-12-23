import type { ApiEntity } from '../api.types'

export interface NotificationEntity extends ApiEntity<'Notification'> {
  /** Backend-controlled notification type; OpenAPI defines it as a string. */
  type: string
  title: string
  message: string | null
  isRead: boolean
  isBanner: boolean
  link: string | null
  linkText: string | null
}
