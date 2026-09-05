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
  applyPushedNotification: (notification: NotificationEntity) => void
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
        .forEach(toast)

      toastedUnreadIds = new Set(
        notifications.map((notification) => notification.id)
      )
    }

    function toast(notification: NotificationEntity): void {
      uiStore.createToast({
        title: notification.title,
        text: notification.message ?? undefined,
        icon: getNotificationIcon(notification.type),
        type: getNotificationToastType(notification.type)
      })
    }

    /**
     * Takes a notification pushed over the hub. Goes through the same `toastedUnreadIds` set the
     * poll maintains: a push that skipped it would be toasted a second time by the next
     * reconcile poll, which rebuilds the set from whatever it sees in the list.
     */
    function applyPushedNotification(notification: NotificationEntity): void {
      if (toastedUnreadIds.has(notification.id)) {
        return
      }

      const current = unreadNotifications.data.value ?? []

      // The poll may already have picked it up in a race; keep one copy either way.
      if (!current.some((existing) => existing.id === notification.id)) {
        // data is a shallowRef, so the array is replaced rather than mutated in place.
        unreadNotifications.data.value = [notification, ...current]
      }

      toastedUnreadIds.add(notification.id)
      toast(notification)
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
      applyPushedNotification,
      loadRead,
      reset
    }
  }
)

export { useNotificationsStore }
