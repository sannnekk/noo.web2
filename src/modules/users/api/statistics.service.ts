import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { StatisticsDto, StatisticsQuery } from './statistics.types'

const BASE_PATH = '/statistics'

interface IStatisticsService {
  /**
   * Fetches the statistics for a specific user.
   *
   * @param userId The ID of the user whose statistics to retrieve.
   * @param query Optional filters (work type, date range).
   */
  getForUser(
    userId: string,
    query?: StatisticsQuery
  ): Promise<ApiResponse<StatisticsDto>>
  /**
   * Fetches platform-wide statistics.
   *
   * @param query Optional filters (work type, date range).
   */
  getForPlatform(query?: StatisticsQuery): Promise<ApiResponse<StatisticsDto>>
}

function toQueryParams(query?: StatisticsQuery): Record<string, string> {
  const params: Record<string, string> = {}

  if (!query) {
    return params
  }

  if (query.workType) {
    params.workType = query.workType
  }

  if (query.from) {
    params.from = query.from.toISOString()
  }

  if (query.to) {
    params.to = query.to.toISOString()
  }

  return params
}

async function getForUser(
  userId: string,
  query?: StatisticsQuery
): Promise<ApiResponse<StatisticsDto>> {
  return await Api.get(`${BASE_PATH}/user/${userId}`, toQueryParams(query))
}

async function getForPlatform(
  query?: StatisticsQuery
): Promise<ApiResponse<StatisticsDto>> {
  return await Api.get(`${BASE_PATH}/platform`, toQueryParams(query))
}

export const StatisticsService: IStatisticsService = {
  getForUser,
  getForPlatform
}
