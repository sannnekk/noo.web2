import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { NotificationService } from '../api/endpoints/notification.service'
import type { NotificationEntity } from '../api/endpoints/notification.types'
import { useGlobalUIStore } from './global-ui.store'
import { useNotificationsStore } from './notifications.store'

function notification(id: string): NotificationEntity {
  return {
    id,
    type: 'info',
    title: `Notification ${id}`,
    message: 'body',
    isRead: false,
    isBanner: false,
    link: null,
    linkText: null
  } as NotificationEntity
}

describe('notifications store — pushed notifications', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  test('adds a pushed notification to the unread list and toasts it once', () => {
    const store = useNotificationsStore()
    const uiStore = useGlobalUIStore()
    const toastSpy = vi.spyOn(uiStore, 'createToast')

    store.applyPushedNotification(notification('a'))

    // Pinia unwraps the nested refs, so this is the array itself.
    expect(store.unreadNotifications.data).toHaveLength(1)
    expect(store.unreadCount).toBe(1)
    expect(toastSpy).toHaveBeenCalledTimes(1)
  })

  test('puts the newest notification first', () => {
    const store = useNotificationsStore()

    store.applyPushedNotification(notification('a'))
    store.applyPushedNotification(notification('b'))

    expect(
      store.unreadNotifications.data?.map((item: NotificationEntity) => item.id)
    ).toEqual(['b', 'a'])
  })

  test('ignores the same notification pushed twice', () => {
    const store = useNotificationsStore()
    const uiStore = useGlobalUIStore()
    const toastSpy = vi.spyOn(uiStore, 'createToast')

    store.applyPushedNotification(notification('a'))
    store.applyPushedNotification(notification('a'))

    // Pinia unwraps the nested refs, so this is the array itself.
    expect(store.unreadNotifications.data).toHaveLength(1)
    expect(toastSpy).toHaveBeenCalledTimes(1)
  })

  // The reconcile poll rebuilds the toasted set from whatever it finds in the list, so a push
  // that skipped that set would be toasted a second time the next time the app polls.
  test('does not re-toast a pushed notification when the next poll returns it', async () => {
    const store = useNotificationsStore()
    const uiStore = useGlobalUIStore()
    const toastSpy = vi.spyOn(uiStore, 'createToast')

    store.applyPushedNotification(notification('a'))

    vi.spyOn(NotificationService, 'getUnread').mockResolvedValue({
      data: [notification('a')]
    })

    await store.pollUnread()

    expect(toastSpy).toHaveBeenCalledTimes(1)
  })

  test('toasts a notification the poll brings that was never pushed', async () => {
    const store = useNotificationsStore()
    const uiStore = useGlobalUIStore()
    const toastSpy = vi.spyOn(uiStore, 'createToast')

    store.applyPushedNotification(notification('a'))

    vi.spyOn(NotificationService, 'getUnread').mockResolvedValue({
      data: [notification('a'), notification('b')]
    })

    await store.pollUnread()

    expect(toastSpy).toHaveBeenCalledTimes(2)
  })
})
