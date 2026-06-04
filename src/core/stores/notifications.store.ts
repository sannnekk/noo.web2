import { defineStore } from 'pinia'
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { isApiError } from '../api/api.utils'
import { NotificationService } from '../api/endpoints/notification.service'
import type { NotificationEntity } from '../api/endpoints/notification.types'
import {
  getNotificationIcon,
  getNotificationToastType
} from '../api/endpoints/notification.utils'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '../composables/useApiRequest'
import { useGlobalUIStore } from './global-ui.store'

interface NotificationsStore {
  isPaneOpen: ShallowRef<boolean>
  unreadCount: ComputedRef<number>
  unreadCountText: ComputedRef<string>
  readNotifications: UseApiRequestReturn<void, NotificationEntity[]>
  unreadNotifications: UseApiRequestReturn<void, NotificationEntity[]>
  markAllAsRead: UseApiRequestReturn
  deleteNotification: UseApiRequestReturn<string>
  pollUnread: () => Promise<void>
  loadRead: () => Promise<void>
  reset: () => void
}

const useNotificationsStore = defineStore(
  'global:notifications',
  (): NotificationsStore => {
    const uiStore = useGlobalUIStore()

    const isPaneOpen = shallowRef(false)

    const readNotifications = useApiRequest(NotificationService.getRead)

    const unreadNotifications = useApiRequest(NotificationService.getUnread)

    const unreadCount = computed(
      () => unreadNotifications.data.value?.length ?? 0
    )

    const unreadCountText = computed(() =>
      unreadCount.value > 99 ? '99+' : `${unreadCount.value}`
    )

    let toastedUnreadIds = new Set<string>()

    async function pollUnread(): Promise<void> {
      const response = await NotificationService.getUnread()

      if (isApiError(response)) {
        return
      }

      const notifications = response.data ?? []

      unreadNotifications.data.value = notifications

      notifications
        .filter((notification) => !toastedUnreadIds.has(notification.id))
        .forEach((notification) => {
          uiStore.createToast({
            title: notification.title,
            text: notification.message ?? undefined,
            icon: getNotificationIcon(notification.type),
            type: getNotificationToastType(notification.type)
          })
        })

      toastedUnreadIds = new Set(
        notifications.map((notification) => notification.id)
      )
    }

    async function loadRead(): Promise<void> {
      await readNotifications.execute()
    }

    const markAllAsRead = useApiRequest(
      NotificationService.markAllAsRead,
      () => {
        const justRead = (unreadNotifications.data.value ?? []).map(
          (notification) => ({ ...notification, isRead: true })
        )

        readNotifications.data.value = [
          ...justRead,
          ...(readNotifications.data.value ?? [])
        ]
        unreadNotifications.data.value = []
        toastedUnreadIds = new Set()
      }
    )

    const deleteNotification = useApiRequest(
      NotificationService.deleteNotification,
      () => {
        pollUnread()
        readNotifications.execute()
      }
    )

    function reset(): void {
      toastedUnreadIds = new Set()
      unreadNotifications.data.value = []
      readNotifications.data.value = []
    }

    return {
      isPaneOpen,
      readNotifications,
      unreadNotifications,
      unreadCount,
      unreadCountText,
      markAllAsRead,
      deleteNotification,
      pollUnread,
      loadRead,
      reset
    }
  }
)

export { useNotificationsStore }
