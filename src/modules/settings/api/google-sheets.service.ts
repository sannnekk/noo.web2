import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleOAuthUrlDto,
  GoogleSheetsIntegrationEntity,
  UpdateGoogleSheetsIntegrationDto
} from './google-sheets.types'

const BASE_PATH = '/google-sheets'

interface IGoogleSheetsService {
  /**
   * Fetches the Google consent URL to open before creating an integration,
   * together with the state that must be handed back with the auth code.
   */
  getOAuthUrl(): Promise<ApiResponse<GoogleOAuthUrlDto>>
  /**
   * Fetches Google Sheets integrations. Mentors only ever receive their own.
   *
   * @param pagination Optional pagination, search and filter parameters.
   */
  get(
    pagination?: IPagination
  ): Promise<ApiResponse<GoogleSheetsIntegrationEntity[]>>
  /**
   * Creates a new Google Sheets integration from a freshly granted consent.
   *
   * @param dto Payload describing the integration to create.
   */
  create(
    dto: CreateGoogleSheetsIntegrationDto
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates an integration's name, schedule or enabled state.
   *
   * @param integrationId ID of the integration to update.
   * @param dto Fields to change; omitted fields are left as they are.
   */
  update(
    integrationId: string,
    dto: UpdateGoogleSheetsIntegrationDto
  ): Promise<ApiResponse>
  /**
   * Queues an integration to run. The export happens in the background, so this
   * resolves once the run is scheduled, not once the sheet is written.
   *
   * @param integrationId ID of the integration to run.
   */
  run(integrationId: string): Promise<ApiResponse>
  /**
   * Deletes a Google Sheets integration. The spreadsheet itself is left alone.
   *
   * @param integrationId ID of the integration to delete.
   */
  delete(integrationId: string): Promise<ApiResponse>
}

async function getOAuthUrl(): Promise<ApiResponse<GoogleOAuthUrlDto>> {
  return await Api.get(`${BASE_PATH}/oauth-url`)
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

async function update(
  integrationId: string,
  dto: UpdateGoogleSheetsIntegrationDto
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${integrationId}`, dto)
}

async function run(integrationId: string): Promise<ApiResponse> {
  return await Api.post<void, void>(`${BASE_PATH}/${integrationId}/run`)
}

async function deleteIntegration(integrationId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${integrationId}`)
}

export const GoogleSheetsService: IGoogleSheetsService = {
  getOAuthUrl,
  get,
  create,
  update,
  run,
  delete: deleteIntegration
}
