import {
  type ApiResponse,
  type RequestProgress,
  Api
} from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  AddHelperMentorOptions,
  AssignedWorkEntity,
  AssignedWorkHistoryEntity,
  AssignedWorkProgress,
  AssignedWorkRemakeOptions,
  AssignedWorksMetadata,
  IdResponseDto,
  ReplaceMainMentorOptions,
  ShiftAssignedWorkDeadlineOptions,
  TaskAnswerKey,
  TaskCheckResult,
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
  get(pagination?: IPagination): Promise<ApiResponse<AssignedWorkEntity[]>>
  /**
   * Fetches the metadata of the assigned works for a current student or mentor
   *
   * @returns A promise that resolves to an ApiResponse containing AssignedWorkMetadata
   */
  getMetadata(userId: string): Promise<ApiResponse<AssignedWorksMetadata>>
  /**
   * Fetches an assigned work by its ID.
   *
   * @param id The ID of the assigned work to fetch.
   * @param onProgress Called as the response comes in — a work with its tasks and answers is a heavy one.
   * @returns A promise that resolves to an ApiResponse containing the AssignedWorkEntity object.
   */
  getById(
    id: string,
    onProgress?: (event: RequestProgress) => void
  ): Promise<ApiResponse<AssignedWorkEntity>>
  /**
   * Gets the progress of an assigned work by the id of the Work Assignment.
   * The response is an array since there can be multiple assigned works for one assignment as new attempts
   *
   * @param id The ID of the work assignment to get the progress for.
   * @returns A promise that resolves to an ApiResponse containing the AssignedWorkProgress array.
   */
  getProgress(id: string): Promise<ApiResponse<AssignedWorkProgress[]>>
  /**
   * Gets the history of an assigned work by the id of the assigned work.
   *
   * @param id The ID of the assigned work to get the history for.
   * @returns A promise that resolves to an ApiResponse containing the AssignedWorkHistory array.
   */
  getHistory(id: string): Promise<ApiResponse<AssignedWorkHistoryEntity[]>>
  /**
   * Creates a new assigned work from a course work assignment id.
   *
   * @param courseWorkAssignmentId The ID of the course work assignment to create an assigned work from.
   * @returns A promise that resolves to an ApiResponse containing the ID of the newly created assigned work.
   */
  create(courseWorkAssignmentId: string): Promise<ApiResponse<IdResponseDto>>
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
  /**
   * Gets the answer key of one task, for tasks that offer it before the work is checked.
   *
   * @param assignedWorkId The work the task belongs to.
   * @param taskId The task to reveal the answer of.
   */
  getTaskAnswerKey(
    assignedWorkId: string,
    taskId: string
  ): Promise<ApiResponse<TaskAnswerKey>>
  /**
   * Checks one task on its own and records the result. The answer is locked afterwards.
   *
   * @param assignedWorkId The work the task belongs to.
   * @param taskId The task to check.
   */
  checkTask(
    assignedWorkId: string,
    taskId: string
  ): Promise<ApiResponse<TaskCheckResult>>
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

async function getMetadata(
  userId: string
): Promise<ApiResponse<AssignedWorksMetadata>> {
  return await Api.get(`${BASE_PATH}/${userId}/metadata`)
}

async function getById(
  id: string,
  onProgress?: (event: RequestProgress) => void
): Promise<ApiResponse<AssignedWorkEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`, undefined, undefined, onProgress)
}

async function getHistory(
  id: string
): Promise<ApiResponse<AssignedWorkHistoryEntity[]>> {
  return await Api.get(`${BASE_PATH}/${id}/history`)
}

async function getProgress(
  id: string
): Promise<ApiResponse<AssignedWorkProgress[]>> {
  return await Api.get(`${BASE_PATH}/${id}/progress`)
}

async function create(
  courseWorkAssignmentId: string
): Promise<ApiResponse<IdResponseDto>> {
  return await Api.post<void, IdResponseDto>(
    `${BASE_PATH}/${courseWorkAssignmentId}`
  )
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
  return await Api.post<void, void>(`${BASE_PATH}/${id}/mark-solved`)
}

async function markChecked(id: string): Promise<ApiResponse> {
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

async function getTaskAnswerKey(
  assignedWorkId: string,
  taskId: string
): Promise<ApiResponse<TaskAnswerKey>> {
  return await Api.get(
    `${BASE_PATH}/${assignedWorkId}/task/${taskId}/answer-key`
  )
}

async function checkTask(
  assignedWorkId: string,
  taskId: string
): Promise<ApiResponse<TaskCheckResult>> {
  return await Api.post<void, TaskCheckResult>(
    `${BASE_PATH}/${assignedWorkId}/task/${taskId}/check`
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
  return await Api.patch<void, void>(`${BASE_PATH}/${id}/return-to-solve`)
}

async function markUnchecked(id: string): Promise<ApiResponse> {
  return await Api.patch<void, void>(`${BASE_PATH}/${id}/return-to-check`)
}

async function deleteAssignedWork(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const AssignedWorkService: IAssignedWorkService = {
  get,
  getMetadata,
  getById,
  getProgress,
  getHistory,
  create,
  remake,
  markSolved,
  markChecked,
  saveAnswer,
  saveComment,
  getTaskAnswerKey,
  checkTask,
  archive,
  unarchive,
  addMentor,
  replaceMainMentor,
  shiftDeadline,
  markUnsolved,
  markUnchecked,
  delete: deleteAssignedWork
}
