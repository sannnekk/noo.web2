import { defineStore } from 'pinia'
import { shallowRef, watch, type ShallowRef } from 'vue'
import type { ApiError, RequestProgress } from '../api/api.utils'
import { useLoadingProgress } from '../composables/useLoadingProgress'
import { uid } from '../utils/id.utils'

export interface Toast {
  id: string
  icon?: string
  title?: string
  text?: string
  type?: 'success' | 'warning' | 'error' | 'info'
}

interface GlobalUIStore {
  pageTitle: ShallowRef<string | undefined>
  setPageTitle: (title: string) => void
  isLoading: ShallowRef<boolean>
  loadingProgress: ShallowRef<number | undefined>
  loadingText: ShallowRef<string | undefined>
  setLoading: (
    loading: boolean,
    loadingProgress?: number,
    loadingText?: string
  ) => void
  /**
   * Runs a slow piece of work behind the fullscreen loader, with a progress bar
   * that follows the transfer where its size is known and eases forward where
   * it is not.
   *
   * The task is handed a progress sink to pass to any service that accepts one:
   *
   * ```ts
   * const response = await uiStore.withLoader('Загрузка работы...', (onProgress) =>
   *   AssignedWorkService.getById(id, onProgress)
   * )
   * ```
   *
   * The loader is taken down when the work settles, however it settles.
   */
  withLoader: <T>(
    text: string | undefined,
    task: (onProgress: (event: RequestProgress) => void) => Promise<T>
  ) => Promise<T>
  toasts: ShallowRef<Toast[]>
  createToast: (toast: Omit<Toast, 'id'>) => void
  createErrorToast: (title: string, text?: string) => void
  createApiErrorToast: (title: string, error?: ApiError) => void
  createWarningToast: (title: string, text?: string) => void
  createSuccessToast: (title: string, text?: string) => void
  removeToast: (id: string) => void
}

const useGlobalUIStore = defineStore('global:ui', (): GlobalUIStore => {
  const pageTitle = shallowRef<string>()

  function setPageTitle(title: string) {
    pageTitle.value = title
  }

  const isLoading = shallowRef(false)
  const loadingProgress = shallowRef<number>()
  const loadingText = shallowRef<string>()

  function setLoading(loading: boolean, progress?: number, text?: string) {
    isLoading.value = loading
    loadingProgress.value = progress
    loadingText.value = text
  }

  const loadingTracker = useLoadingProgress()

  watch(loadingTracker.progress, (value) => {
    if (loadingTracker.isRunning.value) {
      loadingProgress.value = value
    }
  })

  /**
   * Depth of nested `withLoader` calls, so an inner one finishing does not pull
   * the loader out from under the work still going on around it.
   */
  let activeLoaders = 0

  async function withLoader<T>(
    text: string | undefined,
    task: (onProgress: (event: RequestProgress) => void) => Promise<T>
  ): Promise<T> {
    if (activeLoaders === 0) {
      loadingTracker.start()
      setLoading(true, 0, text)
    }

    activeLoaders += 1

    try {
      return await task(loadingTracker.report)
    } finally {
      activeLoaders -= 1

      if (activeLoaders === 0) {
        loadingTracker.finish()
        setLoading(false)
      }
    }
  }

  const toasts = shallowRef<Toast[]>([])

  const TOAST_LIFETIME_MS = 4000

  function createToast(toast: Omit<Toast, 'id'>) {
    const id = uid()

    toasts.value = [{ id, ...toast }, ...toasts.value]

    setTimeout(() => {
      removeToast(id)
    }, TOAST_LIFETIME_MS)
  }

  function createErrorToast(title: string, textOrError?: string | ApiError) {
    let text = textOrError

    if (typeof textOrError !== 'string') {
      if (textOrError) {
        text = textOrError.description
      } else {
        text = 'Неизвестная ошибка'
      }
    }

    createToast({ title, type: 'error', text: text as string })
  }

  function createWarningToast(title: string, text?: string) {
    createToast({ title, type: 'warning', text })
  }

  function createApiErrorToast(title: string, error?: ApiError) {
    const errorText = error
      ? `${error.name}: ${error.description}`
      : 'Неизвестная ошибка'

    createToast({ title, type: 'error', text: errorText })
  }

  function createSuccessToast(title: string, text?: string) {
    createToast({ title, type: 'success', text })
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    pageTitle,
    setPageTitle,
    isLoading,
    loadingProgress,
    loadingText,
    setLoading,
    withLoader,
    toasts,
    createToast,
    createApiErrorToast,
    createErrorToast,
    createWarningToast,
    createSuccessToast,
    removeToast
  }
})

export { useGlobalUIStore }
