import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { MediaEntity } from './media.types'

interface IMediaService {
  upload: (file: File) => Promise<ApiResponse<MediaEntity>>
  delete: (mediaId: string) => Promise<ApiResponse>
}

async function upload(file: File): Promise<ApiResponse<MediaEntity>> {
  return await Api.fileUpload('/media/upload', [file])
}

async function deleteMedia(mediaId: string): Promise<ApiResponse> {
  return await Api.delete(`/media/${mediaId}`)
}

export const MediaService: IMediaService = {
  upload,
  delete: deleteMedia
}
