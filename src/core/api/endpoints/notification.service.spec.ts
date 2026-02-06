import { describe, expect, it, vi } from 'vitest'
import { Api, type ApiResponse } from '../api.utils'
import { NotificationService } from './notification.service'
import type { NotificationEntity } from './notification.types'

vi.mock('../api.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api.utils')>()

  return {
    ...actual,
    Api: {
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    }
  }
})

describe('NotificationService', () => {
  describe('getUnread', () => {
    it('should fetch unread notifications', async () => {
      const mockResponse: ApiResponse<NotificationEntity[]> = {
        data: [
          {
            _entityName: 'Notification',
            id: '1',
            title: 'Test notification',
            message: 'Test notification',
            isRead: false,
            type: 'info',
            isBanner: false,
            link: null,
            linkText: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }

      vi.mocked(Api.get).mockResolvedValue(mockResponse)

      const result = await NotificationService.getUnread()

      expect(Api.get).toHaveBeenCalledWith('/notification', { IsRead: false })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getRead', () => {
    it('should fetch read notifications', async () => {
      const mockResponse: ApiResponse<NotificationEntity[]> = {
        data: [
          {
            _entityName: 'Notification',
            id: '2',
            title: 'Test read notification',
            message: 'Test read notification',
            isRead: true,
            type: 'info',
            isBanner: false,
            link: null,
            linkText: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }

      vi.mocked(Api.get).mockResolvedValue(mockResponse)

      const result = await NotificationService.getRead()

      expect(Api.get).toHaveBeenCalledWith('/notification', { IsRead: true })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      vi.mocked(Api.get).mockResolvedValue({
        data: [
          {
            _entityName: 'Notification',
            id: '1',
            title: 't',
            message: null,
            isRead: false,
            type: 'info',
            isBanner: false,
            link: null,
            linkText: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      } as ApiResponse<NotificationEntity[]>)
      vi.mocked(Api.patch).mockResolvedValue({ data: undefined } as ApiResponse)

      await NotificationService.markAllAsRead()

      expect(Api.get).toHaveBeenCalledWith('/notification', { IsRead: false })
      expect(Api.patch).toHaveBeenCalledWith('/notification/1/mark-read')
    })
  })

  describe('deleteNotification', () => {
    it('should delete a notification by ID', async () => {
      const notificationId = '123'

      await NotificationService.deleteNotification(notificationId)

      expect(Api.delete).toHaveBeenCalledWith(`/notification/${notificationId}`)
    })
  })
})
