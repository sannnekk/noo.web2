import { shallowRef } from 'vue'

function useSaveStatus() {
  const isLoading = shallowRef(false)
  const lastSavedAt = shallowRef<Date | null>(null)
  const hasError = shallowRef(false)

  function beginSave() {
    isLoading.value = true
    hasError.value = false
  }

  function endSave(options: { success: boolean }) {
    isLoading.value = false

    if (options.success) {
      lastSavedAt.value = new Date()
      hasError.value = false
    } else {
      hasError.value = true
    }
  }

  function reset() {
    isLoading.value = false
    lastSavedAt.value = null
    hasError.value = false
  }

  return {
    isLoading,
    lastSavedAt,
    hasError,
    beginSave,
    endSave,
    reset
  }
}

export { useSaveStatus }
