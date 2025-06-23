import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type { UserEntity } from './user.types'

const BASE_PATH = '/user'

interface IUserService {
  /**
   * Fetches a list of users
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of UserEntity objects.
   */
  get(pagination?: IPagination): Promise<ApiResponse<UserEntity[]>>
  /**
   * Fetches a user by its ID.
   *
   * @param id The ID of the user to fetch.
   * @returns A promise that resolves to an ApiResponse containing the UserEntity object.
   */
  getById(id: string): Promise<ApiResponse<UserEntity>>
  /**
   * Block a user
   *
   * @param userId The ID of the user to block
   */
  block(userId: string): Promise<ApiResponse>
  /**
   * Unblock a user
   *
   * @param userId The ID of the user to unblock
   */
  unblock(userId: string): Promise<ApiResponse>

  // TODO: other endpoints ...

  /**
   * Delete a user
   */
  deleteMe(): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<UserEntity[]>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay for demonstration purposes

  return await Api.get(
    BASE_PATH,
    pagination ? pagination.toQuery() : undefined
  )
}

async function getById(id: string): Promise<ApiResponse<UserEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function block(userId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}/block`)
}

async function unblock(userId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}/unblock`)
}

async function deleteMe(): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}`)
}

export const UserService: IUserService = {
  get,
  getById,
  block,
  unblock,
  deleteMe
}
