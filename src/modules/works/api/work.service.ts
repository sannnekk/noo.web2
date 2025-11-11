import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type { PossiblyUnsavedWork } from '../types'
import type { UnsavedWork, WorkEntity, WorkStatistics } from './work.types'

const BASE_PATH = '/work'

interface IWorkService {
  /**
   * Fetches a list of works
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of WorkEntity objects.
   */
  get(pagination?: IPagination): Promise<ApiResponse<WorkEntity[]>>
  /**
   * Fetches a work by its ID.
   *
   * @param id The ID of the work to fetch.
   * @returns A promise that resolves to an ApiResponse containing the WorkEntity object.
   */
  getById(id: string): Promise<ApiResponse<WorkEntity>>
  /**
   * Created a new work entity
   *
   * @param work The work object to create
   * @returns ID of the work created, in a Promise
   */
  create(work: PossiblyUnsavedWork): Promise<ApiResponse<string>>
  /**
   * Update a work using JSONPatchDocument
   *
   * @params id ID of the work to update
   * @params patchDocument A JSONPatchDocument to use for update
   */
  update(id: string, patch: JsonPatchDocument<WorkEntity>): Promise<ApiResponse>
  /**
   * Get work statistics by its id
   *
   * @params id ID of the work to get statistics for
   * @returns Work statistics
   */
  getStatisticsById(id: string): Promise<ApiResponse<WorkStatistics>>
  /**
   * Delete a work.
   *
   * @param id The ID of the work to be deleted.
   */
  delete(id: string): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<WorkEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<WorkEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function getStatisticsById(
  id: string
): Promise<ApiResponse<WorkStatistics>> {
  return await Api.get(`${BASE_PATH}/${id}/statistics`)
}

async function create(work: UnsavedWork): Promise<ApiResponse<string>> {
  return await Api.post(BASE_PATH, work)
}

async function update(
  id: string,
  patch: JsonPatchDocument<WorkEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}`, patch)
}

async function deleteWork(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const WorkService: IWorkService = {
  get,
  getById,
  getStatisticsById,
  create,
  update,
  delete: deleteWork
}
