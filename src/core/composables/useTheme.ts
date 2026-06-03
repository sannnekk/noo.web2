import { useColorMode } from '@vueuse/core'
import type { Ref } from 'vue'
import { CookieStorage } from '../utils/cookies.utils'

export type Theme = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  mode: Ref<Theme>
  toggle: () => void
  setTheme: (theme?: Theme | null) => void
}

function useTheme(): UseThemeReturn {
  const mode = useColorMode({
    selector: 'html',
    storageKey: CookieStorage.StorageAliases.theme
  })

  function toggle() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(theme?: Theme | null) {
    mode.value = theme === 'system' || !theme ? 'auto' : theme
  }

  return {
    mode: mode as Ref<Theme>,
    toggle,
    setTheme
  }
}

export { useTheme }
