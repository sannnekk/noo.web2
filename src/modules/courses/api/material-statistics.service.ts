import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  MaterialFileDownloader,
  MaterialFileDownloadSummary
} from './material-statistics.types'

const BASE_PATH = '/course'

interface IMaterialStatisticsService {
  /**
   * Fetches download totals for every file attached to a course material.
   * Files nobody has downloaded are included, at zero.
   *
   * @param materialId The ID of the material whose attachments to summarize.
   */
  getFileDownloadSummary(
    materialId: string
  ): Promise<ApiResponse<MaterialFileDownloadSummary[]>>
  /**
   * Fetches who downloaded a material's files, how many times, and when they
   * last did.
   *
   * @param materialId The ID of the material.
   * @param pagination Pagination object. Add a `mediaId` filter to narrow the
   * breakdown to a single file; without one it covers every file of the material.
   */
  getFileDownloaders(
    materialId: string,
    pagination?: IPagination
  ): Promise<ApiResponse<MaterialFileDownloader[]>>
}

async function getFileDownloadSummary(
  materialId: string
): Promise<ApiResponse<MaterialFileDownloadSummary[]>> {
  return await Api.get(
    `${BASE_PATH}/material/${materialId}/file-downloads/summary`
  )
}

async function getFileDownloaders(
  materialId: string,
  pagination?: IPagination
): Promise<ApiResponse<MaterialFileDownloader[]>> {
  return await Api.get(
    `${BASE_PATH}/material/${materialId}/file-downloads`,
    pagination ? pagination.toQuery() : undefined
  )
}

export const MaterialStatisticsService: IMaterialStatisticsService = {
  getFileDownloadSummary,
  getFileDownloaders
}
