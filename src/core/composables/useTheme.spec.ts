import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { useTheme } from './useTheme'

const stored = ref<'light' | 'dark' | 'auto'>('light')
const system = ref<'light' | 'dark'>('dark')

vi.mock('@vueuse/core', () => ({
  // Stands in for useColorMode with `emitAuto`: reading gives the choice as made,
  // while `state` gives what that choice resolves to.
  useColorMode: () =>
    Object.assign(stored, {
      state: computedState()
    })
}))

function computedState() {
  return {
    get value() {
      return stored.value === 'auto' ? system.value : stored.value
    }
  }
}

describe('useTheme', () => {
  test('reports the choice as made, system included', () => {
    stored.value = 'auto'

    const { mode } = useTheme()

    expect(mode.value).toBe('system')

    mode.value = 'dark'
    expect(stored.value).toBe('dark')

    mode.value = 'system'
    expect(stored.value).toBe('auto')
  })

  test('resolves what is actually on screen', () => {
    stored.value = 'auto'
    system.value = 'dark'

    const { resolved } = useTheme()

    expect(resolved.value).toBe('dark')

    stored.value = 'light'
    expect(resolved.value).toBe('light')
  })

  test('toggles away from what is showing, not from what was chosen', () => {
    stored.value = 'auto'
    system.value = 'dark'

    const { toggle } = useTheme()

    // Following a dark system, so the first toggle has to land on light.
    toggle()
    expect(stored.value).toBe('light')

    toggle()
    expect(stored.value).toBe('dark')
  })
})
