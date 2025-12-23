import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  AddHelperMentorOptions,
  AssignedWorkEntity,
  AssignedWorkProgress,
  AssignedWorkRemakeOptions,
  IdResponseDto,
  ReplaceMainMentorOptions,
  ShiftAssignedWorkDeadlineOptions,
  UpsertAssignedWorkAnswerDto,
  UpsertAssignedWorkCommentDto
} from './assigned-work.types'

const BASE_PATH = '/assigned-work'

interface IAssignedWorkService {
  /**
   * Fetches a list of assigned works for the current user or a specific user.
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @param userId The ID of the user to get assigned works for. If not provided, the current user will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of AssignedWorkEntity objects.
   */
  get(
    pagination?: IPagination,
    userId?: string
  ): Promise<ApiResponse<AssignedWorkEntity[]>>
  /**
   * Fetches an assigned work by its ID.
   *
   * @param id The ID of the assigned work to fetch.
   * @returns A promise that resolves to an ApiResponse containing the AssignedWorkEntity object.
   */
  getById(id: string): Promise<ApiResponse<AssignedWorkEntity>>
  /**
   * Gets the progress of an assigned work by its ID.
   *
   * @param id The ID of the assigned work to get progress for.
   * @returns A promise that resolves to an ApiResponse containing the AssignedWorkProgress object.
   */
  getProgress(id: string): Promise<ApiResponse<AssignedWorkProgress>>
  /**
   * Creates a new assigned work that will be a copy of the original assigned work but marked as a new attempt
   *
   * @param id The ID of the assigned work to remake
   * @param attempt The id of the new AssignedWorkEntity to be created
   */
  remake(
    id: string,
    remakeOptions?: AssignedWorkRemakeOptions
  ): Promise<ApiResponse<IdResponseDto>>
  /**
   * Marks an assigned work as solved.
   *
   * @param id The ID of the assigned work to mark as solved.
   */
  markSolved(id: string): Promise<ApiResponse>
  /**
   * Marks an assigned work as checked.
   *
   * @param id The ID of the assigned work to mark as checked.
   */
  markChecked(id: string): Promise<ApiResponse>
  /** Save (upsert) a single answer for an assigned work. */
  saveAnswer(
    assignedWorkId: string,
    answer: UpsertAssignedWorkAnswerDto
  ): Promise<ApiResponse<IdResponseDto>>
  /** Save (upsert) a comment for an assigned work. */
  saveComment(
    assignedWorkId: string,
    comment: UpsertAssignedWorkCommentDto
  ): Promise<ApiResponse<IdResponseDto>>
  /**
   * Archive an assigned work. The work will be archived for the current user or a user role.
   *
   * @param id The ID of the assigned work to be archived.
   */
  archive(id: string): Promise<ApiResponse>
  /**
   * Unarchive an assigned work. The work will be unarchived for the current user or a user role.
   *
   * @param id The ID of the assigned work to be unarchived.
   */
  unarchive(id: string): Promise<ApiResponse>
  /**
   * Add a mentor to an assigned work. If the mentor is already assigned, an error will be returned from server.
   *
   * @param id The ID of the assigned work to add a mentor to.
   * @param options The options for adding the mentor.
   */
  addMentor(id: string, options: AddHelperMentorOptions): Promise<ApiResponse>
  /**
   * Replace main mentor of assigned work.
   *
   * @param id The ID of the assigned work to replace the main mentor.
   * @param options Replace options.
   */
  replaceMainMentor(
    id: string,
    options: ReplaceMainMentorOptions
  ): Promise<ApiResponse>
  /**
   * Shift the deadline for an assigned work. The deadline will be shifted for the current user or a user role.
   *
   * @param id The ID of the assigned work to shift the deadline for.
   * @param options Shift options.
   */
  shiftDeadline(
    id: string,
    options: ShiftAssignedWorkDeadlineOptions
  ): Promise<ApiResponse>
  /**
   * Mark an assigned work as unsolved.
   *
   * @param id The ID of the assigned work to mark as unsolved.
   */
  markUnsolved(id: string): Promise<ApiResponse>
  /**
   * Mark an assigned work as unchecked.
   *
   * @param id The ID of the assigned work to mark as unchecked.
   */
  markUnchecked(id: string): Promise<ApiResponse>
  /** Delete an assigned work.
   *
   * @param id The ID of the assigned work to be deleted.
   */
  delete(id: string): Promise<ApiResponse>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<AssignedWorkEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<AssignedWorkEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

async function getProgress(
  id: string
): Promise<ApiResponse<AssignedWorkProgress>> {
  return await Api.get(`${BASE_PATH}/${id}/progress`)
}

async function remake(
  id: string,
  remakeOptions?: AssignedWorkRemakeOptions
): Promise<ApiResponse<IdResponseDto>> {
  return await Api.post<AssignedWorkRemakeOptions | undefined, IdResponseDto>(
    `${BASE_PATH}/${id}/remake`,
    remakeOptions
  )
}

async function markSolved(id: string): Promise<ApiResponse> {
  // OpenAPI: POST /assigned-work/{assignedWorkId}/mark-solved
  return await Api.post<void, void>(`${BASE_PATH}/${id}/mark-solved`)
}

async function markChecked(id: string): Promise<ApiResponse> {
  // OpenAPI: POST /assigned-work/{assignedWorkId}/mark-checked
  return await Api.post<void, void>(`${BASE_PATH}/${id}/mark-checked`)
}

async function saveAnswer(
  assignedWorkId: string,
  answer: UpsertAssignedWorkAnswerDto
): Promise<ApiResponse<IdResponseDto>> {
  return await Api.post<UpsertAssignedWorkAnswerDto, IdResponseDto>(
    `${BASE_PATH}/${assignedWorkId}/save-answer`,
    answer
  )
}

async function saveComment(
  assignedWorkId: string,
  comment: UpsertAssignedWorkCommentDto
): Promise<ApiResponse<IdResponseDto>> {
  return await Api.post<UpsertAssignedWorkCommentDto, IdResponseDto>(
    `${BASE_PATH}/${assignedWorkId}/comment`,
    comment
  )
}

async function archive(id: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}/archive`)
}

async function unarchive(id: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}/unarchive`)
}

async function addMentor(
  id: string,
  options: AddHelperMentorOptions
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}/add-helper-mentor`, options)
}

async function replaceMainMentor(
  id: string,
  options: ReplaceMainMentorOptions
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}/replace-main-mentor`, options)
}

async function shiftDeadline(
  id: string,
  options: ShiftAssignedWorkDeadlineOptions
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}/shift-deadline`, options)
}

async function markUnsolved(id: string): Promise<ApiResponse> {
  // OpenAPI: PATCH /assigned-work/{assignedWorkId}/return-to-solve
  return await Api.patch<void, void>(`${BASE_PATH}/${id}/return-to-solve`)
}

async function markUnchecked(id: string): Promise<ApiResponse> {
  // OpenAPI: PATCH /assigned-work/{assignedWorkId}/return-to-check
  return await Api.patch<void, void>(`${BASE_PATH}/${id}/return-to-check`)
}

async function deleteAssignedWork(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const AssignedWorkService: IAssignedWorkService = {
  get,
  getById,
  getProgress,
  remake,
  markSolved,
  markChecked,
  saveAnswer,
  saveComment,
  archive,
  unarchive,
  addMentor,
  replaceMainMentor,
  shiftDeadline,
  markUnsolved,
  markUnchecked,
  delete: deleteAssignedWork
}
