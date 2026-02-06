import { type ApiResponse, Api, isApiError } from '../api.utils'
import type { NotificationEntity } from './notification.types'

interface INotificationService {
  getUnread: () => Promise<ApiResponse<NotificationEntity[]>>
  getRead: () => Promise<ApiResponse<NotificationEntity[]>>
  markAllAsRead: () => Promise<ApiResponse>
  deleteNotification: (notificationId: string) => Promise<ApiResponse>
}

async function getUnread(): Promise<ApiResponse<NotificationEntity[]>> {
  return await Api.get('/notification', { IsRead: false })
}

async function getRead(): Promise<ApiResponse<NotificationEntity[]>> {
  return await Api.get('/notification', { IsRead: true })
}

async function markAllAsRead(): Promise<ApiResponse> {
  // OpenAPI does not expose a bulk mark-all-as-read endpoint.
  // Implement it using PATCH `/notification/{notificationId}/mark-read`.
  const unread = await getUnread()

  if (isApiError(unread)) {
    return unread
  }

  const notifications = unread.data ?? []

  for (const notification of notifications) {
    const result = await Api.patch<void, void>(
      `/notification/${notification.id}/mark-read`
    )

    if (isApiError(result)) {
      return result
    }
  }

  return { data: undefined }
}

async function deleteNotification(
  notificationId: string
): Promise<ApiResponse> {
  return await Api.delete(`/notification/${notificationId}`)
}

export const NotificationService: INotificationService = {
  getUnread,
  getRead,
  markAllAsRead,
  deleteNotification
}
