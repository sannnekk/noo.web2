import { shallowRef, type Ref } from 'vue'

type ViewMode = 'view' | 'edit' | 'create' | 'error' | 'loading'

interface ViewModeState {
  mode: Ref<ViewMode>
  setMode: (value: ViewMode) => void
  resetMode: () => void
}

function useViewMode(initialMode: ViewMode): ViewModeState {
  const mode: Ref<ViewMode> = shallowRef<ViewMode>(initialMode)

  function setMode(value: ViewMode): void {
    mode.value = value
  }

  function resetMode(): void {
    mode.value = initialMode
  }

  return {
    mode,
    setMode,
    resetMode
  }
}

export { useViewMode, type ViewMode, type ViewModeState }
