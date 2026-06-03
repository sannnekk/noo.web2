import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { OnlineInfo, SessionEntity } from './session.types'

const BASE_PATH = '/session'

interface ISessionService {
  /**
   * Fetches the current user's list of sessions.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of SessionEntity objects.
   */
  get(): Promise<ApiResponse<SessionEntity[]>>
  /**
   * Get user online info
   *
   * @returns A promise that resolves to an ApiResponse containing an object with online status and last active time.
   */
  getOnlineInfo(userId: string): Promise<ApiResponse<OnlineInfo>>
  /**
   * Deletes the current user session.
   * Typically used to log out the user.
   *
   * @returns A promise that resolves to an ApiResponse.
   */
  deleteCurrent(): Promise<ApiResponse>
  /**
   * Deletes a specific session by its ID.
   *
   * @param sessionId The ID of the session to delete.
   * @returns A promise that resolves to an ApiResponse.
   */
  delete(sessionId: string): Promise<ApiResponse>
}

async function get(): Promise<ApiResponse<SessionEntity[]>> {
  return await Api.get(BASE_PATH)
}

async function getOnlineInfo(userId: string): Promise<ApiResponse<OnlineInfo>> {
  return await Api.get(`${BASE_PATH}/${userId}/online`)
}

async function deleteCurrent(): Promise<ApiResponse> {
  return await Api.delete(BASE_PATH)
}

async function deleteSession(sessionId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${sessionId}`)
}

export const SessionService: ISessionService = {
  get,
  getOnlineInfo,
  deleteCurrent,
  delete: deleteSession
}
