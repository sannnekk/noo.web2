import { afterEach, describe, expect, test, vi } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import { useHotkeys, useRegisteredHotkeys } from './useHotkeys'

const scopes: EffectScope[] = []

/** Registers as a component would, so the registration can be taken away again. */
function register(...args: Parameters<typeof useHotkeys>): EffectScope {
  const scope = effectScope()

  scope.run(() => useHotkeys(...args))
  scopes.push(scope)

  return scope
}

function press(init: KeyboardEventInit, target?: HTMLElement): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { ...init, cancelable: true })

  if (target) {
    vi.spyOn(event, 'target', 'get').mockReturnValue(target)
  }

  document.dispatchEvent(event)

  return event
}

afterEach(() => {
  while (scopes.length > 0) {
    scopes.pop()?.stop()
  }
})

describe('useHotkeys', () => {
  test('runs the handler when its combination is pressed', () => {
    const handler = vi.fn()

    register(() => [{ combo: 'mod+s', description: 'Сохранить', handler }])

    press({ key: 's', code: 'KeyS', ctrlKey: true })

    expect(handler).toHaveBeenCalledOnce()
  })

  test('keeps the browser from acting on the key as well', () => {
    register(() => [
      { combo: 'mod+s', description: 'Сохранить', handler: vi.fn() }
    ])

    const event = press({ key: 's', code: 'KeyS', ctrlKey: true })

    expect(event.defaultPrevented).toBe(true)
  })

  test('lets the browser through where the shortcut says so', () => {
    register(() => [
      {
        combo: 'mod+s',
        description: 'Сохранить',
        preventDefault: false,
        handler: vi.fn()
      }
    ])

    const event = press({ key: 's', code: 'KeyS', ctrlKey: true })

    expect(event.defaultPrevented).toBe(false)
  })

  test('stays out of the way while something is being typed', () => {
    const handler = vi.fn()

    register(() => [
      { combo: 'mod+ArrowRight', description: 'Следующее', handler }
    ])

    press(
      { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true },
      document.createElement('input')
    )

    expect(handler).not.toHaveBeenCalled()
  })

  test('still fires in a field where the shortcut asks to', () => {
    const handler = vi.fn()

    register(() => [
      {
        combo: 'mod+s',
        description: 'Сохранить',
        allowInEditable: true,
        handler
      }
    ])

    press(
      { key: 's', code: 'KeyS', ctrlKey: true },
      document.createElement('input')
    )

    expect(handler).toHaveBeenCalledOnce()
  })

  test('does not fire while its guard says no', () => {
    const handler = vi.fn()
    let allowed = false

    register(() => [
      {
        combo: 'mod+s',
        description: 'Сохранить',
        when: () => allowed,
        handler
      }
    ])

    press({ key: 's', code: 'KeyS', ctrlKey: true })
    expect(handler).not.toHaveBeenCalled()

    allowed = true
    press({ key: 's', code: 'KeyS', ctrlKey: true })
    expect(handler).toHaveBeenCalledOnce()
  })

  test('treats a held-down key as one shortcut', () => {
    const handler = vi.fn()

    register(() => [{ combo: 'mod+s', description: 'Сохранить', handler }])

    press({ key: 's', code: 'KeyS', ctrlKey: true, repeat: true })

    expect(handler).not.toHaveBeenCalled()
  })

  test('gives a combination to whichever component claimed it last', () => {
    const first = vi.fn()
    const second = vi.fn()

    register(() => [{ combo: 'mod+s', description: 'Первое', handler: first }])
    register(() => [{ combo: 'mod+s', description: 'Второе', handler: second }])

    press({ key: 's', code: 'KeyS', ctrlKey: true })

    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  test('lets go of the shortcuts when the component does', () => {
    const handler = vi.fn()
    const scope = register(() => [
      { combo: 'mod+s', description: 'Сохранить', handler }
    ])

    scope.stop()

    press({ key: 's', code: 'KeyS', ctrlKey: true })

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('useRegisteredHotkeys', () => {
  test('separates what the page offers from what holds everywhere', () => {
    register(() => [
      { combo: 'mod+s', description: 'Сохранить', handler: vi.fn() },
      {
        combo: '?',
        description: 'Показать горячие клавиши',
        scope: 'global',
        handler: vi.fn()
      }
    ])

    const { page, global, hasPage } = useRegisteredHotkeys()

    expect(page.value.map((hotkey) => hotkey.combo)).toEqual(['mod+s'])
    expect(global.value.map((hotkey) => hotkey.combo)).toEqual(['?'])
    expect(hasPage.value).toBe(true)
  })

  test('reports no page shortcuts where only a global one is registered', () => {
    register(() => [
      {
        combo: '?',
        description: 'Показать горячие клавиши',
        scope: 'global',
        handler: vi.fn()
      }
    ])

    expect(useRegisteredHotkeys().hasPage.value).toBe(false)
  })

  test('leaves out the shortcuts whose guard says no', () => {
    register(() => [
      {
        combo: 'mod+s',
        description: 'Сохранить',
        when: () => false,
        handler: vi.fn()
      }
    ])

    const { page, hasPage } = useRegisteredHotkeys()

    expect(page.value).toHaveLength(0)
    expect(hasPage.value).toBe(false)
  })

  test('lets a global shortcut ask whether the page has any of its own', () => {
    // The `?` that opens the list does exactly this, and the two computeds must
    // not end up waiting on each other.
    const { hasPage } = useRegisteredHotkeys()

    register(() => [
      {
        combo: '?',
        description: 'Показать горячие клавиши',
        scope: 'global',
        when: () => hasPage.value,
        handler: vi.fn()
      }
    ])

    const { global } = useRegisteredHotkeys()

    expect(global.value).toHaveLength(0)

    register(() => [
      { combo: 'mod+s', description: 'Сохранить', handler: vi.fn() }
    ])

    expect(useRegisteredHotkeys().global.value).toHaveLength(1)
  })

  test('describes the keys ready to be drawn', () => {
    register(() => [
      { combo: 'mod+ArrowRight', description: 'Следующее', handler: vi.fn() }
    ])

    expect(useRegisteredHotkeys().page.value[0].keys).toEqual(['Ctrl', '→'])
  })
})
