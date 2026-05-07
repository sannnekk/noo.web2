import { Api } from '@/core/api/api.utils'
import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaService } from './media.service'

vi.mock('@/core/api/api.utils', async () => {
  const actual = await vi.importActual<typeof import('@/core/api/api.utils')>(
    '@/core/api/api.utils'
  )

  return {
    ...actual,
    Api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      fileUpload: vi.fn()
    }
  }
})

vi.mock('axios', () => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }

  return {
    default: {
      create: vi.fn(() => instance),
      put: vi.fn()
    }
  }
})

describe('MediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requestUpload', () => {
    it('posts the upload-url request and returns the ticket', async () => {
      const ticket = {
        mediaId: 'm1',
        uploadUrl: 'https://s3/x',
        headers: { 'Content-Type': 'image/png' },
        expiresAt: new Date()
      }

      vi.mocked(Api.post).mockResolvedValue({ data: ticket })

      const response = await MediaService.requestUpload({
        category: 'user-avatar',
        fileName: 'a.png',
        contentType: 'image/png'
      })

      expect(Api.post).toHaveBeenCalledWith('/media/upload-url', {
        category: 'user-avatar',
        fileName: 'a.png',
        contentType: 'image/png'
      })
      expect(response).toEqual({ data: ticket })
    })
  })

  describe('completeUpload', () => {
    it('posts the complete request for the given media id', async () => {
      vi.mocked(Api.post).mockResolvedValue({ data: undefined })

      await MediaService.completeUpload('m1', { size: 42, etag: 'abc' })

      expect(Api.post).toHaveBeenCalledWith('/media/m1/complete', {
        size: 42,
        etag: 'abc'
      })
    })
  })

  describe('getDownloadUrl', () => {
    it('fetches the download url for the given media id', async () => {
      vi.mocked(Api.get).mockResolvedValue({ data: { url: 'https://cdn/x' } })

      await MediaService.getDownloadUrl('m1')

      expect(Api.get).toHaveBeenCalledWith('/media/m1/download-url')
    })
  })

  describe('delete', () => {
    it('calls the delete endpoint', async () => {
      vi.mocked(Api.delete).mockResolvedValue({ data: undefined })

      await MediaService.delete('m1')

      expect(Api.delete).toHaveBeenCalledWith('/media/m1')
    })
  })

  describe('upload', () => {
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })

    it('runs the full request → PUT → complete flow', async () => {
      const ticket = {
        mediaId: 'm1',
        uploadUrl: 'https://s3/upload',
        headers: { 'Content-Type': 'image/png', 'x-amz-meta-foo': 'bar' },
        expiresAt: new Date()
      }
      const media = { id: 'm1' }

      vi.mocked(Api.post)
        .mockResolvedValueOnce({ data: ticket })
        .mockResolvedValueOnce({ data: media })
      vi.mocked(axios.put).mockResolvedValue({ headers: { etag: '"e1"' } })

      const response = await MediaService.upload(file, {
        category: 'user-avatar'
      })

      expect(Api.post).toHaveBeenNthCalledWith(1, '/media/upload-url', {
        category: 'user-avatar',
        fileName: 'hello.png',
        contentType: 'image/png',
        entityId: undefined
      })
      expect(axios.put).toHaveBeenCalledWith(
        ticket.uploadUrl,
        file,
        expect.objectContaining({ headers: ticket.headers })
      )
      expect(Api.post).toHaveBeenNthCalledWith(2, '/media/m1/complete', {
        size: file.size,
        etag: 'e1'
      })
      expect(response).toEqual({ data: media })
    })

    it('returns the ticket request error without calling S3', async () => {
      const error = { id: 'X', statusCode: 400 }

      vi.mocked(Api.post).mockResolvedValueOnce({ error } as never)

      const response = await MediaService.upload(file, {
        category: 'user-avatar'
      })

      expect(axios.put).not.toHaveBeenCalled()
      expect(response).toEqual({ error })
    })

    it('returns an upload error if the S3 PUT fails', async () => {
      vi.mocked(Api.post).mockResolvedValueOnce({
        data: {
          mediaId: 'm1',
          uploadUrl: 'https://s3/upload',
          headers: {},
          expiresAt: new Date()
        }
      })
      vi.mocked(axios.put).mockRejectedValue(new Error('network'))

      const response = await MediaService.upload(file, {
        category: 'user-avatar'
      })

      expect('error' in response && response.error.id).toBe('S3_UPLOAD_FAILED')
    })
  })
})
