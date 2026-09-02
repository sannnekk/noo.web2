import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { describe, expect, it, vi } from 'vitest'
import { Api } from '../api.utils'
import { PlatformSettingsService } from './platform-settings.service'
import type { PlatformSettings } from './platform-settings.types'

vi.mock('../api.utils', () => ({
  Api: {
    get: vi.fn(),
    patch: vi.fn()
  }
}))

describe('PlatformSettingsService', () => {
  describe('get', () => {
    it('calls the settings endpoint and returns the response', async () => {
      const mockResponse = { data: { shopLink: 'https://no-os.ru' } }

      vi.mocked(Api.get).mockResolvedValue(mockResponse)

      const response = await PlatformSettingsService.get()

      expect(Api.get).toHaveBeenCalledWith('/platform/settings')
      expect(response).toEqual(mockResponse)
    })
  })

  describe('update', () => {
    it('sends the patch document to the settings endpoint', async () => {
      const patch: JsonPatchDocument<PlatformSettings> = [
        { op: 'replace', path: '/supportEmail', value: 'help@example.com' }
      ]

      await PlatformSettingsService.update(patch)

      expect(Api.patch).toHaveBeenCalledWith('/platform/settings', patch)
    })
  })
})
