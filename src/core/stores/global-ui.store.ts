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

  function createErrorToast(title: string, textOrError?: string | ApiError) {
    let text = textOrError

    if (typeof textOrError !== 'string') {
      if (textOrError) {
        text = textOrError.description
      } else {
        text = 'Неизвестная ошибка'
      }
    }

    const id = uid()

    toasts.value = [
      {
        id,
        title,
        type: 'error',
        text: text as string
      },
      ...toasts.value
    ]

    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  function createWarningToast(title: string, text?: string) {
    const id = uid()

    toasts.value = [
      {
        id,
        title,
        type: 'warning',
        text
      },
      ...toasts.value
    ]

    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  function createApiErrorToast(title: string, error?: ApiError) {
    const id = uid()

    toasts.value = [
      {
        id,
        title,
        type: 'error',
        text: error?.name ?? 'Неизвестная ошибка'
      },
      ...toasts.value
    ]

    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  function createSuccessToast(title: string, text?: string) {
    const id = uid()

    toasts.value = [
      {
        id,
        title,
        type: 'success',
        text
      },
      ...toasts.value
    ]

    setTimeout(() => {
      removeToast(id)
    }, 4000)
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
    createApiErrorToast,
    createErrorToast,
    createWarningToast,
    createSuccessToast,
    removeToast
  }
})

export { useGlobalUIStore }
