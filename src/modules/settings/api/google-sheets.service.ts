import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleSheetsIntegrationEntity
} from './google-sheets.types'

const BASE_PATH = '/google-sheets'

interface IGoogleSheetsService {
  /**
   * Fetches a list of Google Sheets integrations for the current user.
   *
   * @param pagination Optional pagination, search and filter parameters.
   */
  get(
    pagination?: IPagination
  ): Promise<ApiResponse<GoogleSheetsIntegrationEntity[]>>
  /**
   * Creates a new Google Sheets integration.
   *
   * @param dto Payload describing the integration to create.
   */
  create(
    dto: CreateGoogleSheetsIntegrationDto
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Triggers an immediate run of a Google Sheets integration.
   *
   * @param integrationId ID of the integration to run.
   */
  run(integrationId: string): Promise<ApiResponse>
  /**
   * Deletes a Google Sheets integration.
   *
   * @param integrationId ID of the integration to delete.
   */
  delete(integrationId: string): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<GoogleSheetsIntegrationEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function create(
  dto: CreateGoogleSheetsIntegrationDto
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, dto)
}

async function run(integrationId: string): Promise<ApiResponse> {
  return await Api.post<void, void>(`${BASE_PATH}/${integrationId}/run`)
}

async function deleteIntegration(integrationId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${integrationId}`)
}

export const GoogleSheetsService: IGoogleSheetsService = {
  get,
  create,
  run,
  delete: deleteIntegration
}
