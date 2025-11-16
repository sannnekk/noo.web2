import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type { CourseEntity, CourseMaterialContentEntity } from './course.types'

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

  // TODO: other endpoints ...

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
  return await Api.get(`${BASE_PATH}/${courseId}/material-content/${contentId}`)
}

async function deleteCourse(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const CourseService: ICourseService = {
  get,
  getById,
  getMaterialContent,
  delete: deleteCourse
}
