import { Api, isApiError } from '@/core/api/api.utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { SessionService } from './session.service'
import type { SessionEntity } from './session.types'

// Mock the entire API module
vi.mock('@/core/api/api.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/api/api.utils')>()

  return {
    ...actual,
    Api: {
      get: vi.fn(),
      delete: vi.fn()
    }
  }
})

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('should fetch list of sessions', async () => {
      const mockSessions: SessionEntity[] = [
        {
          _entityName: 'Session',
          id: 'session-1',
          createdAt: new Date('2025-01-01'),
          updatedAt: null,
          lastRequestAt: new Date('2025-01-15'),
          device: 'Chrome',
          os: 'Windows 10',
          browser: 'Chrome',
          deviceType: 'desktop'
        },
        {
          _entityName: 'Session',
          id: 'session-2',
          createdAt: new Date('2025-01-10'),
          updatedAt: null,
          lastRequestAt: new Date('2025-01-14'),
          device: 'Safari',
          os: 'iOS',
          browser: 'Safari',
          deviceType: 'mobile'
        }
      ]

      ;(Api.get as Mock).mockResolvedValue({ data: mockSessions })

      const result = await SessionService.get()

      expect(Api.get).toHaveBeenCalledWith('/session')
      expect(!isApiError(result) && result.data).toEqual(mockSessions)
    })

    test('should handle error response', async () => {
      const mockError = { error: { id: 'ERROR', statusCode: 401 } }

      ;(Api.get as Mock).mockResolvedValue(mockError)

      const result = await SessionService.get()

      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })

    test('should return empty array when no sessions', async () => {
      ;(Api.get as Mock).mockResolvedValue({ data: [] })

      const result = await SessionService.get()

      expect(Api.get).toHaveBeenCalledWith('/session')
      expect(!isApiError(result) && result.data).toEqual([])
    })
  })

  describe('deleteCurrent', () => {
    test('should delete current session', async () => {
      ;(Api.delete as Mock).mockResolvedValue({})

      await SessionService.deleteCurrent()

      expect(Api.delete).toHaveBeenCalledWith('/session')
    })

    test('should handle error when deleting current session', async () => {
      const mockError = { error: { id: 'ERROR', statusCode: 403 } }

      ;(Api.delete as Mock).mockResolvedValue(mockError)

      const result = await SessionService.deleteCurrent()

      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })
  })

  describe('delete', () => {
    test('should delete session by ID', async () => {
      const sessionId = 'session-123'

      ;(Api.delete as Mock).mockResolvedValue({})

      await SessionService.delete(sessionId)

      expect(Api.delete).toHaveBeenCalledWith(`/session/${sessionId}`)
    })

    test('should handle error when deleting session by ID', async () => {
      const sessionId = 'session-123'
      const mockError = { error: { id: 'ERROR', statusCode: 404 } }

      ;(Api.delete as Mock).mockResolvedValue(mockError)

      const result = await SessionService.delete(sessionId)

      expect(Api.delete).toHaveBeenCalledWith(`/session/${sessionId}`)
      expect(isApiError(result) && result.error).toEqual(mockError.error)
    })

    test('should handle authorization error when deleting session', async () => {
      const sessionId = 'session-123'
      const mockError = { error: { id: 'ERROR', statusCode: 401 } }

      ;(Api.delete as Mock).mockResolvedValue(mockError)

      const result = await SessionService.delete(sessionId)

      expect(isApiError(result) && result.error.statusCode).toBe(401)
    })
  })
})
