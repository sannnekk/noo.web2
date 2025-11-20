import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  PossiblyUnsavedCourse,
  PossiblyUnsavedCourseMaterialContent
} from '../types'
import type {
  CourseEntity,
  CourseMaterialContentEntity,
  CourseMembershipEntity,
  CreateCourseMembershipPayload
} from './course.types'

const BASE_PATH = '/course'

interface ICourseService {
  /**
   * Fetches a list of courses
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of CourseEntity objects.
   */
  get(pagination?: IPagination): Promise<ApiResponse<CourseEntity[]>>
  /**
   * Fetches a course by its ID.
   *
   * @param id The ID of the course to fetch.
   * @returns A promise that resolves to an ApiResponse containing the CourseEntity object.
   */
  getById(id: string): Promise<ApiResponse<CourseEntity>>
  /**
   * Fetches the content of a course material by its ID.
   *
   * @param courseId The ID of the course.
   * @param contentId The ID of the course material content.
   * @returns A promise that resolves to an ApiResponse containing the CourseMaterialContentEntity object.
   */
  getMaterialContent(
    courseId: string,
    contentId: string
  ): Promise<ApiResponse<CourseMaterialContentEntity>>
  /**
   * Creates a new course entity
   *
   * @param course The course object to create
   * @returns ID of the course created, in a Promise
   */
  create(course: PossiblyUnsavedCourse): Promise<ApiResponse<{ id: string }>>
  /**
   * Update a course using JSONPatchDocument
   *
   * @param id ID of the course to update
   * @param patch A JSONPatchDocument to use for update
   */
  update(
    id: string,
    patch: JsonPatchDocument<CourseEntity>
  ): Promise<ApiResponse>
  /**
   * Creates a course material content.
   *
   * @param content The material content object to create
   * @returns ID of the material content created, in a Promise
   */
  createMaterialContent(
    content: PossiblyUnsavedCourseMaterialContent
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates a course material content using JSONPatchDocument
   *
   * @param contentId ID of the material content to update
   * @param patch A JSONPatchDocument to use for update
   */
  updateMaterialContent(
    contentId: string,
    patch: JsonPatchDocument<CourseMaterialContentEntity>
  ): Promise<ApiResponse>
  /**
   * Fetches a list of course memberships
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of CourseMembershipEntity objects.
   */
  getMemberships(
    pagination?: IPagination
  ): Promise<ApiResponse<CourseMembershipEntity[]>>
  /**
   * Creates a course membership for a user
   *
   * @param membership The membership object to create
   * @returns The created membership entity
   */
  createMembership(
    membership: CreateCourseMembershipPayload
  ): Promise<ApiResponse<CourseMembershipEntity>>
  /**
   * Removes a course membership for a user
   *
   * @param membershipId The ID of the membership to be deleted.
   */
  deleteMembership(membershipId: string): Promise<ApiResponse>
  /**
   * Delete a course
   *
   * @param id The ID of the course to be deleted.
   */
  delete(id: string): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<CourseEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<CourseEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function getMaterialContent(
  courseId: string,
  contentId: string
): Promise<ApiResponse<CourseMaterialContentEntity>> {
  return await Api.get(`${BASE_PATH}/${courseId}/content/${contentId}`)
}

async function create(
  course: PossiblyUnsavedCourse
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, course)
}

async function update(
  id: string,
  patch: JsonPatchDocument<CourseEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}`, patch)
}

async function createMaterialContent(
  content: PossiblyUnsavedCourseMaterialContent
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(`${BASE_PATH}/material-content`, content)
}

async function updateMaterialContent(
  contentId: string,
  patch: JsonPatchDocument<CourseMaterialContentEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/material-content/${contentId}`, patch)
}

async function getMemberships(
  pagination?: IPagination
): Promise<ApiResponse<CourseMembershipEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/membership`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function createMembership(
  membership: CreateCourseMembershipPayload
): Promise<ApiResponse<CourseMembershipEntity>> {
  return await Api.post(`${BASE_PATH}/membership`, membership)
}

async function deleteMembership(membershipId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/membership/${membershipId}`)
}

async function deleteCourse(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const CourseService: ICourseService = {
  get,
  getById,
  getMaterialContent,
  create,
  update,
  createMaterialContent,
  updateMaterialContent,
  getMemberships,
  createMembership,
  deleteMembership,
  delete: deleteCourse
}
