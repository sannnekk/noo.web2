import { defineStore } from 'pinia'
import { shallowRef, type ShallowRef } from 'vue'
import type { ApiError } from '../api/api.utils'
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
