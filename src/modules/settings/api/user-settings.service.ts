import { Api, type ApiResponse } from '@/core/api/api.utils'
import type {
  UpdateUserSettingsDto,
  UserSettingsDto
} from './user-settings.types'

const BASE_PATH = '/user-settings'

interface IUserSettingsService {
  /**
   * Fetches the current user's personalization settings.
   * Always returns settings; defaults are used when nothing is stored.
   */
  get(): Promise<ApiResponse<UserSettingsDto>>
  /**
   * Replaces the current user's personalization settings with the provided values.
   */
  update(dto: UpdateUserSettingsDto): Promise<ApiResponse>
}

async function get(): Promise<ApiResponse<UserSettingsDto>> {
  return await Api.get(BASE_PATH)
}

async function update(dto: UpdateUserSettingsDto): Promise<ApiResponse> {
  return await Api.patch(BASE_PATH, dto)
}

export const UserSettingsService: IUserSettingsService = {
  get,
  update
}
