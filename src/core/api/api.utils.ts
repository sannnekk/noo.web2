import axios, { type InternalAxiosRequestConfig } from 'axios'
import { appConfig } from '../config/app.config'
import { GlobalEventBus } from '../events/event-bus'
import { CookieStorage } from '../utils/cookies.utils'
import type { LoginResponse } from './endpoints/auth.types'
import { ApiErrorCodes } from './api-error-codes.data'
import { reviveDates, serialize } from './serialization.utils'

const REFRESH_PATH = '/auth/refresh'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Set on the original request once we've already retried it after a refresh. */
    _retry?: boolean
    /** Set on the refresh request itself so a failed refresh never triggers another. */
    skipAuthRefresh?: boolean
  }
}

export type ApiResponse<T = void> =
  | ApiSuccessResponse<T>
  | {
      data: null
      meta?: ApiMetadata | null
    }
  | {
      error: ApiError
    }

export interface ApiSuccessResponse<T = void> {
  data: T
  meta?: ApiMetadata | null
}

export interface ApiError {
  id: string
  logId?: string
  statusCode: number
  name: string
  description?: string
  payload: unknown
}

export interface ApiMetadata {
  total?: number
}

export interface RequestProgress {
  loaded: number
  total?: number
  progress?: number
  bytes: number
  rate?: number
  estimated?: number
}

/**
 * Type guard to check if an API response is an error response.
 * Use this to narrow the `ApiResponse` union before accessing `.data` or `.error`.
 *
 * @example
 * ```ts
 * const response = await Api.get('/path')
 * if (isApiError(response)) {
 *   console.error(response.error)
 *   return
 * }
 * // response.data is safely narrowed here
 * ```
 */
export function isApiError<T>(
  response: ApiResponse<T>
): response is { error: ApiError } {
  return 'error' in response
}

const api = axios.create({
  baseURL: appConfig.apiUrl,
  // Send/receive the httpOnly refresh-token cookie on cross-origin auth requests.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  transformResponse: [
    (data) => {
      if (typeof data === 'string') {
        if (!data) {
          return null
        }

        return JSON.parse(data, reviveDates)
      }

      return data
    }
  ]
})

function normalizeSuccessResponse<T>(raw: unknown): ApiResponse<T> {
  if (!raw) {
    return {
      data: undefined as T
    }
  }

  if (typeof raw === 'object' && raw !== null) {
    const record = raw as Record<string, unknown>

    if ('data' in record) {
      const meta = (record.meta ??
        record.metadata ??
        null) as ApiMetadata | null

      return {
        data: record.data as T,
        meta
      }
    }
  }

  return {
    data: raw as T
  }
}

api.interceptors.request.use((config) => {
  const token = CookieStorage.get<string>(CookieStorage.StorageAliases.apiToken)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function toApiError(error: {
  response?: { status: number; data?: unknown }
}): ApiError {
  if (error.response) {
    const responseBody = error.response.data as unknown
    const exception = (
      typeof responseBody === 'object' && responseBody !== null
        ? ((responseBody as Record<string, unknown>).error ?? responseBody)
        : responseBody
    ) as Record<string, unknown> | null

    const errorId = (exception?.id as string | undefined) ?? 'UNKNOWN_ERROR'
    const logId = exception?.logId as string | undefined
    const message = exception?.message as string | undefined
    const payload = (exception?.payload as unknown) ?? null

    const known = ApiErrorCodes[errorId]
    let description = known?.description ?? ApiErrorCodes.fallback.description

    if (!known && message) {
      description = message
    }

    if (logId) {
      description += `. Обратитесь, пожалуйста, в службу поддержки, указав код ошибки: ${logId}`
    }

    return {
      id: errorId,
      logId,
      statusCode: error.response.status,
      name: known?.name ?? ApiErrorCodes.fallback.name,
      description,
      payload
    }
  }

  return {
    id: 'NETWORK_ERROR',
    statusCode: 0,
    name: ApiErrorCodes.NETWORK_ERROR.name,
    description: ApiErrorCodes.NETWORK_ERROR.description,
    payload: error
  }
}

/**
 * Single-flight access-token refresh. Concurrent 401s all await the same
 * in-flight refresh instead of each hitting `/auth/refresh`. Resolves to `true`
 * when a new access token was obtained, `false` otherwise.
 */
let refreshPromise: Promise<boolean> | null = null

function refreshAccessToken(): Promise<boolean> {
  // The refresh token rides along in the httpOnly cookie. Mark the request so the
  // interceptor below never tries to refresh a failed refresh (no loop).
  refreshPromise ??= api
    .post(REFRESH_PATH, undefined, { skipAuthRefresh: true })
    .then((response) => {
      const normalized = normalizeSuccessResponse<LoginResponse>(response.data)

      if (isApiError(normalized) || !normalized.data?.accessToken) {
        return false
      }

      CookieStorage.set(
        CookieStorage.StorageAliases.apiToken,
        normalized.data.accessToken
      )
      CookieStorage.set(
        CookieStorage.StorageAliases.userId,
        normalized.data.userId
      )
      CookieStorage.set(
        CookieStorage.StorageAliases.userRole,
        normalized.data.userRole
      )

      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean
          skipAuthRefresh?: boolean
        })
      | undefined

    const isUnauthorized = error.response?.status === 401
    const canRefresh =
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      CookieStorage.isSet(CookieStorage.StorageAliases.apiToken)

    if (canRefresh) {
      originalRequest._retry = true

      const refreshed = await refreshAccessToken()

      if (refreshed) {
        // The request interceptor re-attaches the fresh token from the cookie.
        return api(originalRequest)
      }

      // Refresh failed (session revoked / refresh token expired or reused):
      // fall back to the forced re-login modal.
      GlobalEventBus.emit('auth:login-expired', undefined)
    }

    return Promise.reject(toApiError(error))
  }
)

async function httpGet<T>(
  path: string,
  params?: Record<string, unknown> | URLSearchParams,
  headers?: Record<string, string>,
  onProgress?: (progressEvent: RequestProgress) => void
): Promise<ApiResponse<T>> {
  try {
    const response = await api.get(path, {
      params,
      headers,
      onDownloadProgress: (event) => onProgress?.(event)
    })

    return normalizeSuccessResponse<T>(response.data)
  } catch (error) {
    return { error } as ApiResponse<T>
  }
}

async function httpPost<TRequest, TResponse>(
  path: string,
  body?: TRequest,
  headers?: Record<string, string>,
  onProgress?: (progressEvent: RequestProgress) => void
): Promise<ApiResponse<TResponse>> {
  try {
    const response = await api.post(path, serialize(body), {
      headers,
      onUploadProgress: (event) => onProgress?.(event)
    })

    return normalizeSuccessResponse<TResponse>(response.data)
  } catch (error) {
    return { error } as ApiResponse<TResponse>
  }
}

async function httpPatch<TRequest, TResponse = void>(
  path: string,
  body?: TRequest,
  headers?: Record<string, string>,
  onProgress?: (progressEvent: RequestProgress) => void
): Promise<ApiResponse<TResponse>> {
  try {
    const response = await api.patch(path, serialize(body), {
      headers,
      onDownloadProgress: (event) => onProgress?.(event)
    })

    return normalizeSuccessResponse<TResponse>(response.data)
  } catch (error) {
    return { error } as ApiResponse<TResponse>
  }
}

async function httpDelete(
  path: string,
  headers?: Record<string, string>
): Promise<ApiResponse> {
  try {
    const response = await api.delete(path, { headers })

    return normalizeSuccessResponse<void>(response.data)
  } catch (error) {
    return { error } as ApiResponse
  }
}

async function httpFileUpload<T>(
  path: string,
  body: File[],
  headers?: Record<string, string>,
  onProgress?: (progressEvent: RequestProgress) => void
): Promise<ApiResponse<T>> {
  try {
    const response = await api.post(path, body, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (event) => onProgress?.(event)
    })

    return normalizeSuccessResponse<T>(response.data)
  } catch (error) {
    return { error } as ApiResponse<T>
  }
}

export const Api = {
  get: httpGet,
  post: httpPost,
  patch: httpPatch,
  delete: httpDelete,
  fileUpload: httpFileUpload
}
