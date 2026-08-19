import { useColorMode } from '@vueuse/core'
import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import { LocalStorage } from '../utils/local-storage.utils'

export type Theme = 'light' | 'dark' | 'system'

/**
 * The theme is a preference of the device, not of the account: it is kept in this
 * browser's storage and never travels to the server, so the same person can read
 * dark on a phone at night and light on a desktop by day.
 *
 * Written outside {@link LocalStorage}'s envelope format by `useColorMode`, which
 * is why the sweep at the end of a session leaves it alone — see that module.
 */
const STORAGE_KEY = `${LocalStorage.KEY_PREFIX}theme`

interface UseThemeReturn {
  /** The theme the user picked, which may be to follow the system. */
  mode: WritableComputedRef<Theme>
  /** The theme actually on screen, once "system" has been resolved. */
  resolved: ComputedRef<Exclude<Theme, 'system'>>
  /** Switches between light and dark, away from whatever is showing now. */
  toggle: () => void
}

function useTheme(): UseThemeReturn {
  const colorMode = useColorMode({
    selector: 'html',
    storageKey: STORAGE_KEY,
    // Report the choice as made rather than as resolved, so "follow the system"
    // stays visible as a choice instead of reading back as light or dark.
    emitAuto: true
  })

  // `useColorMode` calls following the system "auto"; nothing outside here has to know.
  const mode = computed<Theme>({
    get: () =>
      colorMode.value === 'auto' ? 'system' : (colorMode.value as Theme),
    set: (theme) => {
      colorMode.value = theme === 'system' ? 'auto' : theme
    }
  })

  const resolved = computed<Exclude<Theme, 'system'>>(() =>
    colorMode.state.value === 'dark' ? 'dark' : 'light'
  )

  function toggle(): void {
    mode.value = resolved.value === 'light' ? 'dark' : 'light'
  }

  return { mode, resolved, toggle }
}

export { useTheme }
