import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type { SubjectEntity, UnsavedSubject } from './subject.types'

const BASE_PATH = '/subject'

interface ISubjectService {
  /**
   * Fetches a list of subjects
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of SubjectEntity objects.
   */
  get(pagination?: IPagination): Promise<ApiResponse<SubjectEntity[]>>
  /**
   * Fetches a subject by its ID.
   *
   * @param id The ID of the subject to fetch.
   * @returns A promise that resolves to an ApiResponse containing the SubjectEntity object.
   */
  getById(id: string): Promise<ApiResponse<SubjectEntity>>
  /**
   * Creates a new subject entity
   *
   * @param subject The subject object to create
   * @returns ID of the subject created, in a Promise
   */
  create(subject: UnsavedSubject): Promise<ApiResponse<string>>
  /**
   * Update a subject using JSONPatchDocument
   *
   * @param id ID of the subject to update
   * @param patchDocument A JSONPatchDocument to use for update
   */
  update(
    id: string,
    patch: JsonPatchDocument<SubjectEntity>
  ): Promise<ApiResponse>
  /**
   * Delete a subject.
   *
   * @param id The ID of the subject to be deleted.
   */
  delete(id: string): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<SubjectEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<SubjectEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function create(subject: UnsavedSubject): Promise<ApiResponse<string>> {
  return await Api.post(BASE_PATH, subject)
}

async function update(
  id: string,
  patch: JsonPatchDocument<SubjectEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}`, patch)
}

async function deleteSubject(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const SubjectService: ISubjectService = {
  get,
  getById,
  create,
  update,
  delete: deleteSubject
}
