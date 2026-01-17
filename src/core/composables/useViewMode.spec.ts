import { describe, expect, test } from 'vitest'
import { useViewMode } from './useViewMode'

describe('useViewMode', () => {
  test('initializes with provided mode', () => {
    const { mode } = useViewMode('create')

    expect(mode.value).toBe('create')
  })

  test('updates and resets mode', () => {
    const { mode, setMode, resetMode } = useViewMode('view')

    setMode('edit')
    expect(mode.value).toBe('edit')

    setMode('loading')
    expect(mode.value).toBe('loading')

    resetMode()
    expect(mode.value).toBe('view')
  })
})
