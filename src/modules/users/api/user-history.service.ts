import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type { UserHistoryEntity } from './user-history.types'

const BASE_PATH = '/user'

interface IUserHistoryService {
  /**
   * Fetches a user's activity log, paginated.
   *
   * The perspective (`subject` or `actor`) is passed as a regular filter through
   * the pagination object, so it can be driven by the same filter controls as the
   * event type and the date range.
   *
   * @param userId The ID of the user whose history to fetch.
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of UserHistoryEntity objects.
   */
  get(
    userId: string,
    pagination?: IPagination
  ): Promise<ApiResponse<UserHistoryEntity[]>>
}

async function get(
  userId: string,
  pagination?: IPagination
): Promise<ApiResponse<UserHistoryEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/${userId}/history`,
    pagination ? pagination.toQuery() : undefined
  )
}

export const UserHistoryService: IUserHistoryService = {
  get
}
