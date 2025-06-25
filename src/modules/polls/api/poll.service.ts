import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type { PollEntity, PossiblyUnsavedPoll } from './poll.types'

const BASE_PATH = '/poll'

interface IPollService {
  /**
   * Fetches a list of polls.
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of PollEntity objects.
   */
  get: (pagination?: IPagination) => Promise<ApiResponse<PollEntity[]>>
  /**
   * Fetches a poll by its ID.
   *
   * @param id The ID of the poll to fetch.
   * @returns A promise that resolves to an ApiResponse containing the PollEntity object.
   */
  getById: (id: string) => Promise<ApiResponse<PollEntity>>
  /**
   * Creates a new poll.
   *
   * @param poll The poll to create, represented as an UnsavedEntity.
   * @returns A promise that resolves to an ApiResponse containing the ID of the created poll.
   */
  create: (poll: PossiblyUnsavedPoll) => Promise<ApiResponse<{ id: string }>>
  /**
   * Updates an existing poll.
   *
   * @param id The ID of the poll to update.
   * @param poll The updated poll data.
   * @returns A promise that resolves to an ApiResponse indicating the success of the operation.
   */
  update: (id: string, poll: PossiblyUnsavedPoll) => Promise<ApiResponse>
  /**
   * Deletes a poll.
   *
   * @param id The ID of the poll to delete.
   * @returns A promise that resolves to an ApiResponse indicating the success of the operation.
   */
  delete: (id: string) => Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<PollEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<PollEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function create(
  poll: PossiblyUnsavedPoll
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, poll)
}

async function update(
  id: string,
  poll: PossiblyUnsavedPoll
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}`, poll)
}

async function deletePoll(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const PollService: IPollService = {
  get,
  getById,
  create,
  update,
  delete: deletePoll
}
