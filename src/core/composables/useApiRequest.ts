import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import type {
  ApiError,
  ApiMetadata,
  ApiResponse,
  ApiSuccessResponse,
  RequestProgress
} from '../api/api.utils'
import { isApiError } from '../api/api.utils'
import {
  useLoadingProgress,
  type UseLoadingProgressOptions
} from './useLoadingProgress'

export interface UseApiRequestOptions {
  /**
   * Whether to follow the request with a progress value fit to drive a progress
   * bar. On by default; turn it off for requests whose progress nobody shows.
   */
  trackProgress?: boolean
  /** Tuning for the guessed part of it, see {@link useLoadingProgress}. */
  progressOptions?: UseLoadingProgressOptions
}

export interface UseApiRequestReturn<TRequest = void, TResponse = void> {
  data: ShallowRef<TResponse | null>
  metadata?: ShallowRef<ApiMetadata | null>
  error: ShallowRef<ApiError | null>
  isLoading: ShallowRef<boolean>
  /**
   * Progress of the request in flight, 0 to 100, or `null` while none is.
   *
   * Where the transfer reports its size, this is the transfer; where it does
   * not — a gzipped or chunked response, which is most of them — it is an eased
   * guess that slows down as it goes and never reaches 100 on its own. Either
   * way it is safe to bind a progress bar to.
   */
  progress: ComputedRef<number | null>
  execute: (payload: TRequest) => Promise<void>
}

function useApiRequest<TRequest = void, TResponse = void>(
  request: (
    payload: TRequest,
    onProgress?: (event: RequestProgress) => void
  ) => Promise<ApiResponse<TResponse>>,
  onSuccess?: (response: ApiSuccessResponse<TResponse>) => void,
  onError?: (error: ApiError) => void,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<TRequest, TResponse> {
  const { trackProgress = true, progressOptions } = options

  const data = shallowRef<TResponse | null>(null)
  const metadata = shallowRef<ApiMetadata | null>(null)
  const error = shallowRef<ApiError | null>(null)
  const isLoading = shallowRef<boolean>(false)

  const progressTracker = useLoadingProgress(progressOptions)

  // Between requests there is no progress to speak of, rather than a stale
  // percentage or a zero that looks like a stalled transfer.
  const progress = computed<number | null>(() =>
    progressTracker.isRunning.value ? progressTracker.progress.value : null
  )

  async function execute(payload: TRequest): Promise<void> {
    isLoading.value = true
    error.value = null
    data.value = null
    metadata.value = null

    if (trackProgress) {
      progressTracker.start()
    }

    const response = await request(payload, (event) => {
      if (trackProgress) {
        progressTracker.report(event)
      }
    })

    progressTracker.reset()

    if (isApiError(response)) {
      error.value = response.error

      if (onError) {
        onError(response.error)
      }
    } else {
      data.value = response.data
      metadata.value = response.meta ?? null

      if (onSuccess && response.data !== null) {
        onSuccess(response as ApiSuccessResponse<TResponse>)
      }
    }

    isLoading.value = false
  }

  return {
    data,
    metadata,
    error,
    isLoading,
    progress,
    execute
  }
}

export { useApiRequest }
