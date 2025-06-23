import { useColorMode } from "@vueuse/core"
import type { Ref } from "vue"
import { CookieStorage } from "../utils/cookies.utils"

export type Theme = 'light' | 'dark'

interface UseThemeReturn {
  mode: Ref<Theme>
  toggle: () => void
  setTheme: (theme: Theme) => void
}

function useTheme(): UseThemeReturn {
  const mode = useColorMode({
    selector: 'html',
    storageKey: CookieStorage.StorageAliases.theme
  })

  function toggle() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(theme: Theme) {
    mode.value = theme
  }

  return {
    mode: mode as Ref<Theme>,
    toggle,
    setTheme
  }
}

export { useTheme }
