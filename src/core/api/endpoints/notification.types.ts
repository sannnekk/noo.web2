import type { ApiEntity } from '../api.types'

export interface FrontendLink {
  name: string
  params?: Record<string, string | number>
}

export interface NotificationEntity extends ApiEntity<'Notification'> {
  type: string
  title: string
  message: string | null
  isRead: boolean
  isBanner: boolean
  link: FrontendLink | null
  linkText: string | null
}
