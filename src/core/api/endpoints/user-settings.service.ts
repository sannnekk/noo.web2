import { Api, type ApiResponse } from '../api.utils'
import type { UserSettings, UserSettingsUpdate } from './user-settings.types'

const BASE_PATH = '/user-settings'

interface IUserSettingsService {
  /**
   * Fetches the current user's personalization settings.
   * Always returns settings; defaults are used when nothing is stored.
   */
  get(): Promise<ApiResponse<UserSettings>>
  /**
   * Replaces the current user's personalization settings with the provided values.
   */
  update(settings: UserSettingsUpdate): Promise<ApiResponse>
}

async function get(): Promise<ApiResponse<UserSettings>> {
  return await Api.get(BASE_PATH)
}

async function update(settings: UserSettingsUpdate): Promise<ApiResponse> {
  return await Api.patch(BASE_PATH, settings)
}

export const UserSettingsService: IUserSettingsService = {
  get,
  update
}
