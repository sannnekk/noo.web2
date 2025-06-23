import { Api, type ApiResponse } from '@/core/api/api.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import type {
  NooTubeVideoCommentEntity,
  NooTubeVideoEntity
} from './nootube.types'

const BASE_PATH = '/nootube'

interface INooTubeService {
  get: (pagination?: IPagination) => Promise<ApiResponse<NooTubeVideoEntity[]>>
  getFavourites: (
    pagination?: IPagination
  ) => Promise<ApiResponse<NooTubeVideoEntity[]>>
  getById: (videoId: string) => Promise<ApiResponse<NooTubeVideoEntity>>
  getComments: (
    pagination?: IPagination
  ) => Promise<ApiResponse<NooTubeVideoCommentEntity[]>>
}

async function get(
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/video`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function getFavourites(
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/favourite`,
    pagination ? pagination.toQuery() : undefined
  )
}

async function getById(
  videoId: string
): Promise<ApiResponse<NooTubeVideoEntity>> {
  return await Api.get(`${BASE_PATH}/video/${videoId}`)
}

async function getComments(
  pagination?: IPagination
): Promise<ApiResponse<NooTubeVideoCommentEntity[]>> {
  return await Api.get(
    `${BASE_PATH}/video/comment`,
    pagination ? pagination.toQuery() : undefined
  )
}

export const NooTubeService: INooTubeService = {
  get,
  getFavourites,
  getById,
  getComments
}
