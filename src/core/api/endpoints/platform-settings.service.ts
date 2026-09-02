import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { Api, type ApiResponse } from '../api.utils'
import type { PlatformSettings } from './platform-settings.types'

const BASE_PATH = '/platform/settings'

interface IPlatformSettingsService {
  /**
   * Fetches the platform's links and contacts. Open to anonymous visitors — the
   * footer and the help section are shown before anyone signs in.
   *
   * Always answers: with nothing saved yet the API returns its own defaults.
   */
  get(): Promise<ApiResponse<PlatformSettings>>
  /**
   * Updates the settings using a JSONPatchDocument. Admins only.
   *
   * @param patch A JSONPatchDocument to use for update
   */
  update(patch: JsonPatchDocument<PlatformSettings>): Promise<ApiResponse>
}

async function get(): Promise<ApiResponse<PlatformSettings>> {
  return await Api.get(BASE_PATH)
}

async function update(
  patch: JsonPatchDocument<PlatformSettings>
): Promise<ApiResponse> {
  return await Api.patch(BASE_PATH, patch)
}

export const PlatformSettingsService: IPlatformSettingsService = {
  get,
  update
}
