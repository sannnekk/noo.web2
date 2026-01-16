import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { useTheme } from './useTheme'

vi.mock('@vueuse/core', () => ({
  useColorMode: () => ref<'light' | 'dark'>('light')
}))

describe('useTheme', () => {
  test('toggles and sets theme', () => {
    const { mode, toggle, setTheme } = useTheme()

    expect(mode.value).toBe('light')

    toggle()
    expect(mode.value).toBe('dark')

    setTheme('light')
    expect(mode.value).toBe('light')
  })
})
