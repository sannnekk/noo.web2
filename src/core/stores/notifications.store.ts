import { defineStore } from 'pinia'
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { NotificationService } from '../api/endpoints/notification.service'
import type { NotificationEntity } from '../api/endpoints/notification.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '../composables/useApiRequest'

interface NotificationsStore {
  isPaneOpen: ShallowRef<boolean>
  unreadCount: ComputedRef<number>
  unreadCountText: ComputedRef<string>
  readNotifications: UseApiRequestReturn<void, NotificationEntity[]>
  unreadNotifications: UseApiRequestReturn<void, NotificationEntity[]>
  markAllAsRead: UseApiRequestReturn
  deleteNotification: UseApiRequestReturn<string>
}

const useNotificationsStore = defineStore(
  'global:notifications',
  (): NotificationsStore => {
    const isPaneOpen = shallowRef(false)

    const readNotifications = useApiRequest(NotificationService.getRead)

    const unreadNotifications = useApiRequest(NotificationService.getUnread)

    const unreadCount = computed(
      () => unreadNotifications.data.value?.length ?? 0
    )

    const unreadCountText = computed(() =>
      unreadCount.value > 99 ? '99+' : `${unreadCount.value}`
    )

    const markAllAsRead = useApiRequest(
      NotificationService.markAllAsRead,
      () => {
        unreadNotifications.data.value = []
      }
    )

    const deleteNotification = useApiRequest(
      NotificationService.deleteNotification,
      () => {
        unreadNotifications.execute()
        readNotifications.execute()
      }
    )

    return {
      isPaneOpen,
      readNotifications,
      unreadNotifications,
      unreadCount,
      unreadCountText,
      markAllAsRead,
      deleteNotification
    }
  }
)

export { useNotificationsStore }
