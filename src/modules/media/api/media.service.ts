import {
  type ApiResponse,
  Api,
  isApiError,
  type RequestProgress
} from '@/core/api/api.utils'
import axios, { type AxiosError } from 'axios'
import type {
  CompleteUploadPayload,
  DownloadUrl,
  MediaCategory,
  MediaEntity,
  RequestUploadPayload,
  UploadTicket
} from './media.types'
import { appConfig } from '@/core/config/app.config'

const BASE_PATH = '/media'

interface UploadOptions {
  category: MediaCategory
  entityId?: string
  onProgress?: (progress: RequestProgress) => void
}

interface IMediaService {
  /**
   * Performs a full presigned-URL upload: requests an upload ticket,
   * PUTs the file directly to S3, then confirms the upload server-side.
   */
  upload(file: File, options: UploadOptions): Promise<ApiResponse<MediaEntity>>
  /**
   * Step 1: requests a presigned upload ticket from the API.
   */
  requestUpload(
    payload: RequestUploadPayload
  ): Promise<ApiResponse<UploadTicket>>
  /**
   * Step 3: confirms that the file was successfully uploaded to S3.
   */
  completeUpload(
    mediaId: string,
    payload: CompleteUploadPayload
  ): Promise<ApiResponse<MediaEntity>>
  /**
   * Returns a short-lived presigned URL for downloading the file.
   */
  getDownloadUrl(mediaId: string): Promise<ApiResponse<DownloadUrl>>
  /**
   * Returns a stable URL for rendering the media in-browser. This is not a
   * presigned URL, but a permanent endpoint that proxies the file from S3. To use only
   * for img tags and similar, where the browser handles the download and rendering.
   */
  mediaRawUrl(mediaId: string): string
  /**
   * Permanently removes the file from S3 and the database.
   */
  delete(mediaId: string): Promise<ApiResponse>
}

async function requestUpload(
  payload: RequestUploadPayload
): Promise<ApiResponse<UploadTicket>> {
  return Api.post<RequestUploadPayload, UploadTicket>(
    `${BASE_PATH}/upload-url`,
    payload
  )
}

async function completeUpload(
  mediaId: string,
  payload: CompleteUploadPayload
): Promise<ApiResponse<MediaEntity>> {
  return Api.post<CompleteUploadPayload, MediaEntity>(
    `${BASE_PATH}/${mediaId}/complete`,
    payload
  )
}

async function getDownloadUrl(
  mediaId: string
): Promise<ApiResponse<DownloadUrl>> {
  return Api.get<DownloadUrl>(`${BASE_PATH}/${mediaId}/download-url`)
}

function mediaRawUrl(mediaId: string): string {
  return `${appConfig.apiUrl}/media/${mediaId}/raw`
}

async function deleteMedia(mediaId: string): Promise<ApiResponse> {
  return Api.delete(`${BASE_PATH}/${mediaId}`)
}

async function upload(
  file: File,
  options: UploadOptions
): Promise<ApiResponse<MediaEntity>> {
  const ticketResponse = await requestUpload({
    category: options.category,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    entityId: options.entityId
  })

  if (isApiError(ticketResponse)) {
    return ticketResponse
  }

  const ticket = ticketResponse.data

  if (!ticket) {
    return { error: toUploadError(new Error('Empty upload ticket response')) }
  }

  try {
    const putResponse = await axios.put(ticket.uploadUrl, file, {
      headers: ticket.headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (event) => options.onProgress?.(event)
    })

    const etag = extractEtag(putResponse.headers)

    return await completeUpload(ticket.mediaId, {
      size: file.size,
      etag
    })
  } catch (error) {
    return {
      error: toUploadError(error)
    }
  }
}

function extractEtag(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined
  }

  const record = headers as Record<string, unknown>
  const raw = record.etag ?? record.ETag ?? record.Etag

  if (typeof raw !== 'string') {
    return undefined
  }

  return raw.replace(/"/g, '')
}

function toUploadError(error: unknown) {
  const axiosError = error as AxiosError | undefined
  const statusCode = axiosError?.response?.status ?? 0

  return {
    id: 'S3_UPLOAD_FAILED',
    statusCode,
    name: 'Ошибка загрузки файла',
    description: 'Не удалось загрузить файл в хранилище. Попробуйте ещё раз.',
    payload: error
  }
}

export const MediaService: IMediaService = {
  upload,
  requestUpload,
  completeUpload,
  getDownloadUrl,
  mediaRawUrl,
  delete: deleteMedia
}
