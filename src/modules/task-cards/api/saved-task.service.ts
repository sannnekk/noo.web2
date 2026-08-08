import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  CreateSavedTaskPayload,
  QuizDeckOptions,
  SavedTaskAnswerCheck,
  SavedTaskEntity,
  SavedTaskReference,
  SavedTaskSubjectSummary
} from './saved-task.types'

const BASE_PATH = '/saved-task'

interface ISavedTaskService {
  /**
   * Fetches a paginated list of the current student's saved tasks.
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of SavedTaskEntity objects.
   */
  get: (pagination?: IPagination) => Promise<ApiResponse<SavedTaskEntity[]>>
  /**
   * Fetches the current student's saved tasks as bare references, so a work page
   * can tell saved tasks from unsaved ones without loading them in full.
   *
   * @param assignedWorkId Narrows the references to the tasks saved from one assigned work.
   * @returns A promise that resolves to an ApiResponse containing an array of SavedTaskReference objects.
   */
  getReferences: (
    assignedWorkId?: string
  ) => Promise<ApiResponse<SavedTaskReference[]>>
  /**
   * Saves a task of a checked assigned work of the current student.
   *
   * @param payload The task to save together with the assigned work it is saved from.
   * @returns A promise that resolves to an ApiResponse containing the id of the created saved task.
   */
  save: (
    payload: CreateSavedTaskPayload
  ) => Promise<ApiResponse<{ id: string }>>
  /**
   * Removes a task from the saved ones.
   *
   * @param savedTaskId The ID of the saved task to remove.
   */
  delete: (savedTaskId: string) => Promise<ApiResponse>
  /**
   * Fetches the subjects the current student has saved tasks on, with how many
   * cards each holds.
   *
   * @returns A promise that resolves to an ApiResponse containing an array of SavedTaskSubjectSummary objects.
   */
  getSubjects: () => Promise<ApiResponse<SavedTaskSubjectSummary[]>>
  /**
   * Fetches a random deck of saved tasks to run a quiz on.
   *
   * @param options The subject to draw from (null for all) and how many cards to draw.
   * @returns A promise that resolves to an ApiResponse containing an array of SavedTaskEntity objects.
   */
  getQuizDeck: (
    options: QuizDeckOptions
  ) => Promise<ApiResponse<SavedTaskEntity[]>>
  /**
   * Checks an answer to one saved task against its answer key. Only defined for
   * tasks that can be checked automatically.
   *
   * @param savedTaskId The ID of the saved task being answered.
   * @param answer The answer to check.
   * @returns A promise that resolves to an ApiResponse containing the verdict.
   */
  checkAnswer: (
    savedTaskId: string,
    answer: string
  ) => Promise<ApiResponse<SavedTaskAnswerCheck>>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<SavedTaskEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getReferences(
  assignedWorkId?: string
): Promise<ApiResponse<SavedTaskReference[]>> {
  const query = new URLSearchParams()

  if (assignedWorkId) {
    query.set('assignedWorkId', assignedWorkId)
  }

  return await Api.get(`${BASE_PATH}/reference`, query)
}

async function save(
  payload: CreateSavedTaskPayload
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, payload)
}

async function deleteSavedTask(savedTaskId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${savedTaskId}`)
}

async function getSubjects(): Promise<ApiResponse<SavedTaskSubjectSummary[]>> {
  return await Api.get(`${BASE_PATH}/subject`)
}

async function getQuizDeck({
  subjectId,
  count
}: QuizDeckOptions): Promise<ApiResponse<SavedTaskEntity[]>> {
  const query = new URLSearchParams({ count: String(count) })

  if (subjectId) {
    query.set('subjectId', subjectId)
  }

  return await Api.get(`${BASE_PATH}/quiz`, query)
}

async function checkAnswer(
  savedTaskId: string,
  answer: string
): Promise<ApiResponse<SavedTaskAnswerCheck>> {
  return await Api.post(`${BASE_PATH}/${savedTaskId}/check`, { answer })
}

export const SavedTaskService: ISavedTaskService = {
  get,
  getReferences,
  save,
  delete: deleteSavedTask,
  getSubjects,
  getQuizDeck,
  checkAnswer
}
