import { Api, type ApiResponse } from '@/core/api/api.utils'
import { uid } from '@/core/utils/id.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  CreateNooTubeVideoPayload,
  NooTubeVideoCommentEntity,
  NooTubeVideoEntity,
  NooTubeVideoUpload,
  PossiblyUnsavedNooTubeVideo,
  PossiblyUnsavedNooTubeVideoComment,
  VideoReaction
} from './nootube.types'

const BASE_PATH = '/nootube'

interface INooTubeService {
  /**
   * Creates a local draft for a new video.
   */
  createDraft: () => PossiblyUnsavedNooTubeVideo
  /**
   * Fetches a paginated list of videos.
   *
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of NooTubeVideoEntity objects.
   */
  get: (pagination?: IPagination) => Promise<ApiResponse<NooTubeVideoEntity[]>>
  /**
   * Fetches a paginated list of the user's favourite videos.
   *
   * @param pagination Pagination object to paginate the results.
   * @returns A promise that resolves to an ApiResponse containing an array of NooTubeVideoEntity objects.
   */
  getFavourites: (
    pagination?: IPagination
  ) => Promise<ApiResponse<NooTubeVideoEntity[]>>
  /**
   * Fetches a paginated list of the user's own videos.
   *
   * @param pagination Pagination object to paginate the results.
   * @returns A promise that resolves to an ApiResponse containing an array of NooTubeVideoEntity objects.
   */
  getOwn: (
    pagination?: IPagination
  ) => Promise<ApiResponse<NooTubeVideoEntity[]>>
  /**
   * Fetches a video by its ID.
   *
   * @param videoId The ID of the video to fetch.
   * @returns A promise that resolves to an ApiResponse containing the NooTubeVideoEntity object.
   */
  getById: (videoId: string) => Promise<ApiResponse<NooTubeVideoEntity>>
  /**
   * Toggles if a video is favourited by the current user.
   *
   * @param videoId The ID of the video to toggle.
   * @returns A promise that resolves to an ApiResponse.
   */
  toggleFavourite: (videoId: string) => Promise<ApiResponse>
  /**
   * Creates a video and initializes an upload on the configured video engine.
   *
   * @param video The video to create together with the upload metadata.
   * @returns A promise that resolves to an ApiResponse containing the upload URL the client should stream the file to.
   */
  create: (
    video: CreateNooTubeVideoPayload
  ) => Promise<ApiResponse<NooTubeVideoUpload>>
  /**
   * Updates a video.
   *
   * @param videoId The ID of the video to update.
   * @param patch The patch document to apply.
   */
  update: (
    videoId: string,
    patch: JsonPatchDocument<PossiblyUnsavedNooTubeVideo>
  ) => Promise<ApiResponse>
  /**
   * Deletes a video.
   *
   * @param videoId The ID of the video to delete.
   */
  delete: (videoId: string) => Promise<ApiResponse>
  /**
   * Marks a video upload as finished and syncs its metadata from the video engine.
   *
   * @param videoId The ID of the video to finish.
   */
  finishUpload: (videoId: string) => Promise<ApiResponse>
  /**
   * Toggles a reaction for a video.
   *
   * @param videoId The ID of the video to react to.
   * @param reaction The reaction to toggle.
   */
  toggleReaction: (
    videoId: string,
    reaction: VideoReaction
  ) => Promise<ApiResponse>
  /**
   * Fetches a paginated list of comments for a video.
   *
   * @param videoId The ID of the video to fetch comments for.
   * @param pagination Pagination object to paginate the results. If not provided, the default pagination will be used.
   * @returns A promise that resolves to an ApiResponse containing an array of NooTubeVideoCommentEntity objects.
   */
  getComments: (
    videoId: string,
    pagination?: IPagination
  ) => Promise<ApiResponse<NooTubeVideoCommentEntity[]>>
  /**
   * Creates a comment for a video.
   *
   * @param videoId The ID of the video to comment on.
   * @param comment The comment to create.
   */
  createComment: (
    videoId: string,
    comment: PossiblyUnsavedNooTubeVideoComment
  ) => Promise<ApiResponse>
  /**
   * Updates a comment.
   *
   * @param videoId The ID of the video the comment belongs to.
   * @param commentId The ID of the comment to update.
   * @param patch The patch document to apply.
   */
  updateComment: (
    videoId: string,
    commentId: string,
    patch: JsonPatchDocument<PossiblyUnsavedNooTubeVideoComment>
  ) => Promise<ApiResponse>
  /**
   * Deletes a comment.
   *
   * @param videoId The ID of the video the comment belongs to.
   * @param commentId The ID of the comment to delete.
   */
  deleteComment: (videoId: string, commentId: string) => Promise<ApiResponse>
}

function createDraft(): PossiblyUnsavedNooTubeVideo {
  return {
    _entityName: 'NooTubeVideo',
    _key: uid(),
    title: 'Новое видео',
    description: null,
    thumbnailId: null,
    externalIdentifier: null,
    externalUrl: null,
    externalThumbnailUrl: null,
    serviceType: 'kinescope',
    state: 'not-uploaded',
    duration: null,
    isListed: true,
    isFavourite: false,
    publishedAt: new Date(),
    uploadedByUserId: ''
  }
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoEntity[]>> {
  return await Api.get(BASE_PATH, pagination ? pagination.toQuery() : undefined)
}

async function getFavourites(
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoEntity[]>> {
  const query = pagination?.toQuery() ?? new URLSearchParams()

  query.set('type', 'favourite')

  return await Api.get(BASE_PATH, query)
}

async function getOwn(
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoEntity[]>> {
  const query = pagination?.toQuery() ?? new URLSearchParams()

  query.set('type', 'own')

  return await Api.get(BASE_PATH, query)
}

async function getById(
  videoId: string
): Promise<ApiResponse<NooTubeVideoEntity>> {
  return await Api.get(`${BASE_PATH}/${videoId}`)
}

async function toggleFavourite(videoId: string): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${videoId}/favourite`)
}

async function create(
  video: CreateNooTubeVideoPayload
): Promise<ApiResponse<NooTubeVideoUpload>> {
  return await Api.post(BASE_PATH, video)
}

async function update(
  videoId: string,
  patch: JsonPatchDocument<PossiblyUnsavedNooTubeVideo>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${videoId}`, patch)
}

async function deleteVideo(videoId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${videoId}`)
}

async function finishUpload(videoId: string): Promise<ApiResponse> {
  return await Api.post(`${BASE_PATH}/${videoId}/finish`)
}

async function toggleReaction(
  videoId: string,
  reaction: VideoReaction
): Promise<ApiResponse> {
  const query = new URLSearchParams({ reaction })

  return await Api.patch(`${BASE_PATH}/${videoId}/reaction?${query.toString()}`)
}

async function getComments(
  videoId: string,
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoCommentEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/${videoId}/comment`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function createComment(
  videoId: string,
  comment: PossiblyUnsavedNooTubeVideoComment
): Promise<ApiResponse> {
  return await Api.post(`${BASE_PATH}/${videoId}/comment`, comment)
}

async function updateComment(
  videoId: string,
  commentId: string,
  patch: JsonPatchDocument<PossiblyUnsavedNooTubeVideoComment>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${videoId}/comment/${commentId}`, patch)
}

async function deleteComment(
  videoId: string,
  commentId: string
): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${videoId}/comment/${commentId}`)
}

export const NooTubeService: INooTubeService = {
  createDraft,
  get,
  getFavourites,
  getOwn,
  getById,
  toggleFavourite,
  create,
  update,
  delete: deleteVideo,
  finishUpload,
  toggleReaction,
  getComments,
  createComment,
  updateComment,
  deleteComment
}
