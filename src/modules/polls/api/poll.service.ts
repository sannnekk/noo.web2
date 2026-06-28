import { Api, type ApiResponse } from '@/core/api/api.utils'
import { uid } from '@/core/utils/id.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  PollEntity,
  PollParticipationEntity,
  PossiblyUnsavedPoll,
  PossiblyUnsavedQuestion
} from './poll.types'

const BASE_PATH = '/poll'

interface IPollService {
  /**
   * Creates a local draft for a new poll.
   */
  createDraft: () => PossiblyUnsavedPoll
  /**
   * Creates a local draft for a new poll question.
   */
  createQuestionDraft: () => PossiblyUnsavedQuestion
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
   * @param patch The patch document to apply.
   * @returns A promise that resolves to an ApiResponse indicating the success of the operation.
   */
  update: (
    id: string,
    patch: JsonPatchDocument<PossiblyUnsavedPoll>
  ) => Promise<ApiResponse>
  /**
   * Deletes a poll.
   *
   * @param id The ID of the poll to delete.
   * @returns A promise that resolves to an ApiResponse indicating the success of the operation.
   */
  delete: (id: string) => Promise<ApiResponse>
  /**
   * Fetches the participations (results) of a poll.
   *
   * @param pollId The ID of the poll whose participations to fetch.
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of PollParticipationEntity objects.
   */
  getParticipations: (
    pollId: string,
    pagination?: IPagination
  ) => Promise<ApiResponse<PollParticipationEntity[]>>
  /**
   * Fetches a single poll participation, including the user's answers.
   *
   * @param participationId The ID of the participation to fetch.
   * @returns A promise that resolves to an ApiResponse containing the PollParticipationEntity object.
   */
  getParticipation: (
    participationId: string
  ) => Promise<ApiResponse<PollParticipationEntity>>
  /**
   * Fetches the polls a specific user has participated in.
   *
   * @param userId The ID of the user whose participated polls to fetch.
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of PollEntity objects.
   */
  getParticipatedPolls: (
    userId: string,
    pagination?: IPagination
  ) => Promise<ApiResponse<PollEntity[]>>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<PollEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getById(id: string): Promise<ApiResponse<PollEntity>> {
  return await Api.get(`${BASE_PATH}/${id}`)
}

function createDraft(): PossiblyUnsavedPoll {
  return {
    _entityName: 'Poll',
    _key: uid(),
    title: 'Новый опрос',
    description: null,
    isActive: true,
    expiresAt: null,
    isAuthRequired: false,
    participationsCount: 0,
    questions: []
  }
}

function createQuestionDraft(): PossiblyUnsavedQuestion {
  return {
    _entityName: 'PollQuestion',
    _key: uid(),
    title: 'Новый вопрос',
    description: null,
    type: 'text',
    isRequired: false,
    config: {}
  }
}

async function create(
  poll: PossiblyUnsavedPoll
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, poll)
}

async function update(
  id: string,
  patch: JsonPatchDocument<PossiblyUnsavedPoll>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${id}`, patch)
}

async function deletePoll(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

async function getParticipations(
  pollId: string,
  pagination?: IPagination
): Promise<ApiResponse<PollParticipationEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/${pollId}/participation`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function getParticipation(
  participationId: string
): Promise<ApiResponse<PollParticipationEntity>> {
  return await Api.get(`${BASE_PATH}/participation/${participationId}`)
}

async function getParticipatedPolls(
  userId: string,
  pagination?: IPagination
): Promise<ApiResponse<PollEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/user/${userId}/participation`,
    pagination ? pagination.toQuery() : undefined
  )
}

export const PollService: IPollService = {
  createDraft,
  createQuestionDraft,
  get,
  getById,
  create,
  update,
  delete: deletePoll,
  getParticipations,
  getParticipation,
  getParticipatedPolls
}
