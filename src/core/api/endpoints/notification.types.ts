import type { ApiEntity } from '../api.types'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationAction {
  label: string
  routeName: string
}

export interface NotificationEntity extends ApiEntity {
  type: NotificationType
  icon: string
  message: string
  isRead: boolean
  actions: NotificationAction[]
}
