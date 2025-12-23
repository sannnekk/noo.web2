import { type ApiResponse, Api } from '../api.utils'
import type { UserSettings, UserSettingsUpdate } from './user-settings.types'

interface IUserSettingsService {
  getSettings: () => Promise<ApiResponse<UserSettings>>
  updateSettings: (settings: UserSettingsUpdate) => Promise<ApiResponse>
}

async function getSettings(): Promise<ApiResponse<UserSettings>> {
  return await Api.get('/user-settings')
}

async function updateSettings(
  settings: UserSettingsUpdate
): Promise<ApiResponse> {
  return await Api.patch('/user-settings', settings)
}

export const UserSettingsService: IUserSettingsService = {
  getSettings,
  updateSettings
}
