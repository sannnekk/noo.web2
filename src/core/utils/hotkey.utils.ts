/**
 * Keyboard shortcut parsing, matching and rendering.
 *
 * Two things drive the design here.
 *
 * The first is the keyboard layout. This platform is written in Russian and most
 * of the people using it type in Cyrillic, where the S key reports `event.key`
 * as `'ы'` — so a shortcut written as `mod+s` and matched on `event.key` would
 * quietly stop working the moment the layout is switched. Letters and digits are
 * therefore matched on `event.code`, which names the physical key whatever the
 * layout says it prints. Punctuation is the other way round: `?` is Shift+/ on a
 * US layout and Shift+7 on a Russian one, and the character produced is the
 * whole point, so those stay on `event.key`.
 *
 * The second is that the browser gets to the key first. Most defaults can be
 * called off with `preventDefault()`, but a handful belong to the browser or the
 * window manager and never reach the page at all — see {@link RESERVED_COMBOS}.
 */

/** A combination as written (`'mod+shift+ArrowRight'`), taken apart. */
export interface ParsedCombo {
  /**
   * Either an `event.code` (`'KeyS'`, `'Digit1'`, `'ArrowRight'`) or, when
   * {@link ParsedCombo.isCharacter} is set, the character to look for in
   * `event.key`.
   */
  key: string
  /** Whether {@link ParsedCombo.key} is matched against `event.key`. */
  isCharacter: boolean
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
}

/** Keys whose `event.code` differs from how one would write them. */
const NAMED_KEY_CODES: Record<string, string> = {
  enter: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  space: 'Space',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  insert: 'Insert',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight'
}

/** How a key is drawn in the shortcuts list, where its name is not the clearest. */
const KEY_LABELS: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Enter: '↵',
  Space: 'Пробел',
  Escape: 'Esc',
  Backspace: '⌫',
  Delete: 'Del',
  PageUp: 'PgUp',
  PageDown: 'PgDn'
}

/**
 * Combinations the browser or the window manager keeps for itself. They never
 * reach the page, so `preventDefault()` has nothing to prevent and a shortcut
 * bound to one of them simply never fires.
 */
export const RESERVED_COMBOS: readonly string[] = [
  'mod+n',
  'mod+shift+n',
  'mod+t',
  'mod+shift+t',
  'mod+w',
  'mod+shift+w',
  'mod+q',
  'mod+l',
  'mod+shift+i',
  'mod+shift+j',
  'mod+shift+c',
  'mod+1',
  'mod+2',
  'mod+3',
  'mod+4',
  'mod+5',
  'mod+6',
  'mod+7',
  'mod+8',
  'mod+9',
  'ctrl+tab',
  'ctrl+shift+tab',
  'f11',
  'f12'
]

/**
 * Whether `mod` means Command rather than Control. Read at call time rather than
 * cached, so a test can stand a different platform in front of it.
 */
function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  const platform =
    (navigator as { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ??
    navigator.platform ??
    ''

  return /mac|iphone|ipad|ipod/i.test(platform)
}

function toKeyCode(token: string): { key: string; isCharacter: boolean } {
  const lower = token.toLowerCase()

  if (lower in NAMED_KEY_CODES) {
    return { key: NAMED_KEY_CODES[lower], isCharacter: false }
  }

  if (/^[a-z]$/.test(lower)) {
    return { key: `Key${lower.toUpperCase()}`, isCharacter: false }
  }

  if (/^[0-9]$/.test(lower)) {
    return { key: `Digit${lower}`, isCharacter: false }
  }

  if (/^f([1-9]|1[0-2])$/.test(lower)) {
    return { key: lower.toUpperCase(), isCharacter: false }
  }

  // Punctuation and anything else: the character produced is what was meant.
  return { key: token, isCharacter: true }
}

/**
 * Takes a combination apart. Modifiers are `mod`, `ctrl`, `meta`, `shift` and
 * `alt` in any order, the last token being the key itself; `mod` stands for
 * Command on Apple platforms and Control everywhere else.
 */
export function parseCombo(combo: string): ParsedCombo {
  const tokens = combo.split('+').filter((token) => token.length > 0)
  // A combination that is nothing but `+` still has a key, and it is `+`.
  const parts = tokens.length > 0 ? tokens : ['+']
  const keyToken = parts[parts.length - 1]
  const modifiers = parts.slice(0, -1).map((token) => token.toLowerCase())
  const usesMod = modifiers.includes('mod')
  const onApple = isApplePlatform()
  const { key, isCharacter } = toKeyCode(keyToken)

  return {
    key,
    isCharacter,
    ctrl:
      modifiers.includes('ctrl') ||
      modifiers.includes('control') ||
      (usesMod && !onApple),
    meta:
      modifiers.includes('meta') ||
      modifiers.includes('cmd') ||
      modifiers.includes('command') ||
      (usesMod && onApple),
    shift: modifiers.includes('shift'),
    alt: modifiers.includes('alt') || modifiers.includes('option')
  }
}

/**
 * Whether a key event is the combination being asked about.
 *
 * Shift is not compared for character combinations: the shift is already spent
 * on producing the character, and asking for it twice would never match.
 */
export function matchesEvent(
  combo: ParsedCombo,
  event: KeyboardEvent
): boolean {
  if (
    combo.ctrl !== event.ctrlKey ||
    combo.meta !== event.metaKey ||
    combo.alt !== event.altKey
  ) {
    return false
  }

  if (combo.isCharacter) {
    return event.key === combo.key
  }

  return combo.shift === event.shiftKey && event.code === combo.key
}

/** The keys of a combination, ready to be drawn one `<kbd>` each. */
export function formatCombo(combo: ParsedCombo): string[] {
  const onApple = isApplePlatform()
  const keys: string[] = []

  if (combo.ctrl) {
    keys.push(onApple ? '⌃' : 'Ctrl')
  }

  if (combo.alt) {
    keys.push(onApple ? '⌥' : 'Alt')
  }

  if (combo.shift && !combo.isCharacter) {
    keys.push(onApple ? '⇧' : 'Shift')
  }

  if (combo.meta) {
    keys.push(onApple ? '⌘' : 'Win')
  }

  if (combo.isCharacter) {
    keys.push(combo.key)

    return keys
  }

  if (combo.key in KEY_LABELS) {
    keys.push(KEY_LABELS[combo.key])

    return keys
  }

  keys.push(combo.key.replace(/^(Key|Digit)/, ''))

  return keys
}

/** Whether the browser would keep this combination to itself. */
export function isReservedByBrowser(combo: string): boolean {
  const parsed = parseCombo(combo)
  const signature = signatureOf(parsed)

  return RESERVED_COMBOS.some(
    (reserved) => signatureOf(parseCombo(reserved)) === signature
  )
}

function signatureOf(combo: ParsedCombo): string {
  return [
    combo.ctrl ? 'ctrl' : '',
    combo.meta ? 'meta' : '',
    combo.shift ? 'shift' : '',
    combo.alt ? 'alt' : '',
    combo.key
  ].join('+')
}

/**
 * Whether the key was typed into something that takes typing — a field, or the
 * rich text editor, which is a `contenteditable` surface. Shortcuts stay out of
 * the way there unless they say otherwise.
 */
export function isFromEditableTarget(event: KeyboardEvent): boolean {
  const target = event.target

  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
