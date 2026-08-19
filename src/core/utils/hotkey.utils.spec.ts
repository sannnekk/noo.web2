import { describe, expect, test, vi } from 'vitest'
import {
  formatCombo,
  isFromEditableTarget,
  isReservedByBrowser,
  matchesEvent,
  parseCombo
} from './hotkey.utils'

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', init)
}

function onPlatform(platform: string, run: () => void): void {
  const original = Object.getOwnPropertyDescriptor(navigator, 'platform')

  Object.defineProperty(navigator, 'platform', {
    value: platform,
    configurable: true
  })

  try {
    run()
  } finally {
    if (original) {
      Object.defineProperty(navigator, 'platform', original)
    }
  }
}

describe('parseCombo', () => {
  test('reads letters and digits as physical keys', () => {
    expect(parseCombo('mod+s').key).toBe('KeyS')
    expect(parseCombo('mod+1').key).toBe('Digit1')
    expect(parseCombo('mod+s').isCharacter).toBe(false)
  })

  test('keeps punctuation as the character it prints', () => {
    const combo = parseCombo('?')

    expect(combo.key).toBe('?')
    expect(combo.isCharacter).toBe(true)
  })

  test('resolves mod to Control away from Apple platforms', () => {
    onPlatform('Linux x86_64', () => {
      const combo = parseCombo('mod+s')

      expect(combo.ctrl).toBe(true)
      expect(combo.meta).toBe(false)
    })
  })

  test('resolves mod to Command on Apple platforms', () => {
    onPlatform('MacIntel', () => {
      const combo = parseCombo('mod+s')

      expect(combo.meta).toBe(true)
      expect(combo.ctrl).toBe(false)
    })
  })
})

describe('matchesEvent', () => {
  test('matches a shortcut typed on a Russian layout', () => {
    onPlatform('Linux x86_64', () => {
      // The S key prints "ы" in Cyrillic, so only `code` can still recognise it.
      const event = keyEvent({ key: 'ы', code: 'KeyS', ctrlKey: true })

      expect(matchesEvent(parseCombo('mod+s'), event)).toBe(true)
    })
  })

  test('matches the same shortcut typed on a Latin layout', () => {
    onPlatform('Linux x86_64', () => {
      const event = keyEvent({ key: 's', code: 'KeyS', ctrlKey: true })

      expect(matchesEvent(parseCombo('mod+s'), event)).toBe(true)
    })
  })

  test('does not fire without its modifier', () => {
    onPlatform('Linux x86_64', () => {
      const event = keyEvent({ key: 's', code: 'KeyS' })

      expect(matchesEvent(parseCombo('mod+s'), event)).toBe(false)
    })
  })

  test('matches punctuation on the character, whatever key produced it', () => {
    const combo = parseCombo('?')

    // Shift+/ on a US layout, Shift+7 on a Russian one; both print "?".
    expect(
      matchesEvent(combo, keyEvent({ key: '?', code: 'Slash', shiftKey: true }))
    ).toBe(true)
    expect(
      matchesEvent(
        combo,
        keyEvent({ key: '?', code: 'Digit7', shiftKey: true })
      )
    ).toBe(true)
  })

  test('tells the arrow keys apart', () => {
    onPlatform('Linux x86_64', () => {
      const combo = parseCombo('mod+ArrowRight')

      expect(
        matchesEvent(
          combo,
          keyEvent({ key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true })
        )
      ).toBe(true)
      expect(
        matchesEvent(
          combo,
          keyEvent({ key: 'ArrowLeft', code: 'ArrowLeft', ctrlKey: true })
        )
      ).toBe(false)
    })
  })
})

describe('formatCombo', () => {
  test('spells the modifiers out away from Apple platforms', () => {
    onPlatform('Linux x86_64', () => {
      expect(formatCombo(parseCombo('mod+s'))).toEqual(['Ctrl', 'S'])
    })
  })

  test('uses the symbols on Apple platforms', () => {
    onPlatform('MacIntel', () => {
      expect(formatCombo(parseCombo('mod+s'))).toEqual(['⌘', 'S'])
    })
  })

  test('draws the arrows and Enter as signs', () => {
    onPlatform('Linux x86_64', () => {
      expect(formatCombo(parseCombo('mod+ArrowRight'))).toEqual(['Ctrl', '→'])
      expect(formatCombo(parseCombo('mod+Enter'))).toEqual(['Ctrl', '↵'])
    })
  })
})

describe('isReservedByBrowser', () => {
  test('recognises what the browser keeps for itself', () => {
    onPlatform('Linux x86_64', () => {
      expect(isReservedByBrowser('mod+t')).toBe(true)
      expect(isReservedByBrowser('mod+w')).toBe(true)
      expect(isReservedByBrowser('mod+1')).toBe(true)
    })
  })

  test('leaves the usable ones alone', () => {
    onPlatform('Linux x86_64', () => {
      expect(isReservedByBrowser('mod+s')).toBe(false)
      expect(isReservedByBrowser('mod+Enter')).toBe(false)
      expect(isReservedByBrowser('mod+ArrowRight')).toBe(false)
    })
  })
})

describe('isFromEditableTarget', () => {
  test.each([
    ['input', true],
    ['textarea', true],
    ['select', true],
    ['div', false]
  ])('reports %s as editable: %s', (tagName, expected) => {
    const element = document.createElement(tagName)
    const event = keyEvent({})

    vi.spyOn(event, 'target', 'get').mockReturnValue(element)

    expect(isFromEditableTarget(event)).toBe(expected)
  })

  test('counts the rich text editor, which is contenteditable', () => {
    const element = document.createElement('div')

    element.setAttribute('contenteditable', 'true')
    // jsdom does not work `isContentEditable` out from the attribute.
    Object.defineProperty(element, 'isContentEditable', { value: true })

    const event = keyEvent({})

    vi.spyOn(event, 'target', 'get').mockReturnValue(element)

    expect(isFromEditableTarget(event)).toBe(true)
  })
})
