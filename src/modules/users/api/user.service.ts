import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { UserRole } from '@/core/api/endpoints/auth.types'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  CreateMentorAssignmentPayload,
  MentorAssignmentEntity,
  UserEntity
} from './user.types'

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
   * Updates a user using JSONPatchDocument
   *
   * @param userId The ID of the user to update
   * @param patch A JSONPatchDocument to use for update
   */
  update(
    userId: string,
    patch: JsonPatchDocument<UserEntity>
  ): Promise<ApiResponse>
  /**
   * Deletes a user by their unique identifier
   *
   * @param userId The ID of the user to delete
   */
  delete(userId: string): Promise<ApiResponse>
  /**
   * Changes the role of a user
   *
   * @param userId The ID of the user
   * @param role The new role to assign
   */
  changeRole(userId: string, role: UserRole): Promise<ApiResponse>
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
  /**
   * Verifies a user manually
   *
   * @param userId The ID of the user to verify
   */
  verifyManual(userId: string): Promise<ApiResponse>
  /**
   * Retrieves a student's mentor assignments
   *
   * @param studentId The ID of the student
   * @param pagination Pagination object to paginate the results.
   */
  getMentorAssignments(
    studentId: string,
    pagination?: IPagination
  ): Promise<ApiResponse<MentorAssignmentEntity[]>>
  /**
   * Retrieves a mentor's student assignments
   *
   * @param mentorId The ID of the mentor
   * @param pagination Pagination object to paginate the results.
   */
  getStudentAssignments(
    mentorId: string,
    pagination?: IPagination
  ): Promise<ApiResponse<MentorAssignmentEntity[]>>
  /**
   * Assigns a mentor to a student for a specific subject
   *
   * @param studentId The ID of the student
   * @param payload The assignment details
   */
  assignMentor(
    studentId: string,
    payload: CreateMentorAssignmentPayload
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Unassigns a mentor from a student
   *
   * @param studentId The ID of the student
   */
  unassignMentor(studentId: string): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<UserEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<UserEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function update(
  userId: string,
  patch: JsonPatchDocument<UserEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}`, patch)
}

async function deleteUser(userId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${userId}`)
}

async function changeRole(
  userId: string,
  role: UserRole
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}/role`, role)
}

async function block(userId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}/block`)
}

async function unblock(userId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}/unblock`)
}

async function verifyManual(userId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${userId}/verify-manual`)
}

async function getMentorAssignments(
  studentId: string,
  pagination?: IPagination
): Promise<ApiResponse<MentorAssignmentEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/${studentId}/mentor-assignment`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function getStudentAssignments(
  mentorId: string,
  pagination?: IPagination
): Promise<ApiResponse<MentorAssignmentEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/${mentorId}/student-assignment`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function assignMentor(
  studentId: string,
  payload: CreateMentorAssignmentPayload
): Promise<ApiResponse<{ id: string }>> {
  return await Api.patch(`${BASE_PATH}/${studentId}/assign-mentor`, payload)
}

async function unassignMentor(studentId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${studentId}/unassign-mentor`)
}

export const UserService: IUserService = {
  get,
  getById,
  update,
  delete: deleteUser,
  changeRole,
  block,
  unblock,
  verifyManual,
  getMentorAssignments,
  getStudentAssignments,
  assignMentor,
  unassignMentor
}
