import {
  computed,
  onScopeDispose,
  shallowRef,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter
} from 'vue'
import {
  formatCombo,
  isFromEditableTarget,
  isReservedByBrowser,
  matchesEvent,
  parseCombo,
  type ParsedCombo
} from '../utils/hotkey.utils'

/**
 * Where a shortcut belongs. Only `page` shortcuts decide whether the keyboard
 * icon shows up in the header; a `global` one is always there and would keep the
 * icon lit on every page, which would say nothing.
 */
type HotkeyScope = 'page' | 'global'

interface HotkeyDefinition {
  /** The combination, as in `'mod+s'`, `'mod+ArrowRight'` or `'?'`. */
  combo: string
  /** What it does, in the words the shortcuts list should use. */
  description: string
  handler: () => void
  /**
   * Whether it applies as things stand. Read while a computed is watching, so a
   * guard the page already has — `canSaveWork` and the like — can be handed
   * straight over.
   */
  when?: () => boolean
  /**
   * Whether it still fires while the caret is in a field or the rich text
   * editor. Off by default, so typing is left alone; saving is the case that
   * wants it on.
   */
  allowInEditable?: boolean
  /** Whether the browser's own action is called off as well. On by default. */
  preventDefault?: boolean
  scope?: HotkeyScope
}

/** A shortcut currently in force, as the shortcuts list needs it. */
interface RegisteredHotkey {
  combo: string
  description: string
  scope: HotkeyScope
  /** The keys to draw, one `<kbd>` each: `['Ctrl', 'S']`. */
  keys: string[]
}

interface Registration {
  id: number
  read: () => HotkeyDefinition[]
}

interface UseRegisteredHotkeysReturn {
  /** What this page declares. */
  page: ComputedRef<RegisteredHotkey[]>
  /** What holds everywhere. */
  global: ComputedRef<RegisteredHotkey[]>
  /** Whether the page declares anything, which is what the header icon follows. */
  hasPage: ComputedRef<boolean>
}

const registrations = shallowRef<Registration[]>([])

let nextRegistrationId = 0

// Parsing is pure and the same handful of combinations come round again on every
// dispatch, so each one is taken apart once.
const parsedCombos = new Map<string, ParsedCombo>()

function getParsedCombo(combo: string): ParsedCombo {
  const cached = parsedCombos.get(combo)

  if (cached) {
    return cached
  }

  const parsed = parseCombo(combo)

  parsedCombos.set(combo, parsed)

  return parsed
}

function readAll(): HotkeyDefinition[] {
  return registrations.value.flatMap((registration) => registration.read())
}

function isEnabled(hotkey: HotkeyDefinition): boolean {
  return hotkey.when?.() ?? true
}

/**
 * Everything in force right now, in the order it was registered — for the list
 * that shows them, which has to keep up with whatever the page enables.
 *
 * Dispatch does not go through here: a cached value would be wrong the moment a
 * guard read something Vue is not watching, and a key press is answered too
 * rarely for the caching to be worth that risk.
 */
const activeHotkeys = computed<HotkeyDefinition[]>(() =>
  readAll().filter(isEnabled)
)

/**
 * Kept apart from {@link activeHotkeys} on purpose. A global shortcut may well
 * ask whether the page has any of its own — the `?` that opens the list does
 * exactly that — and were it to read a computed that evaluates every `when`,
 * including its own, the two would depend on each other. Filtering by scope
 * before any `when` is read keeps that from arising.
 */
const hasPageHotkeys = computed(() =>
  readAll().some(
    (hotkey) => (hotkey.scope ?? 'page') === 'page' && isEnabled(hotkey)
  )
)

function toRegistered(hotkey: HotkeyDefinition): RegisteredHotkey {
  return {
    combo: hotkey.combo,
    description: hotkey.description,
    scope: hotkey.scope ?? 'page',
    keys: formatCombo(getParsedCombo(hotkey.combo))
  }
}

/** The list as shown, with a combination bound twice appearing once. */
const registeredHotkeys = computed<RegisteredHotkey[]>(() => {
  const byCombo = new Map<string, RegisteredHotkey>()

  for (const hotkey of activeHotkeys.value) {
    byCombo.set(hotkey.combo, toRegistered(hotkey))
  }

  return [...byCombo.values()]
})

function onKeydown(event: KeyboardEvent): void {
  // A held-down key is one shortcut, not a stream of them.
  if (event.repeat) {
    return
  }

  const fromEditable = isFromEditableTarget(event)
  const candidates = readAll()

  // Walked backwards, so the most recently mounted component wins a combination
  // it shares with something registered earlier.
  for (let index = candidates.length - 1; index >= 0; index--) {
    const hotkey = candidates[index]

    if (fromEditable && !hotkey.allowInEditable) {
      continue
    }

    if (!matchesEvent(getParsedCombo(hotkey.combo), event)) {
      continue
    }

    // Asked here rather than read off a cached list, so the answer is the one
    // that holds at the moment the key was pressed.
    if (!isEnabled(hotkey)) {
      continue
    }

    // This is what keeps the browser from taking the key instead — Ctrl+S
    // offering to save the page, and so on.
    if (hotkey.preventDefault ?? true) {
      event.preventDefault()
    }

    hotkey.handler()

    return
  }
}

let isListening = false

/**
 * One listener serves every shortcut in the application, put up when the first
 * one is declared and taken down with the last.
 *
 * Deliberately not `useEventListener`: that ties the listener to whichever
 * component's scope happened to declare the first shortcut, and that component
 * unmounting would take the listener away from everything still relying on it.
 */
function startListening(): void {
  if (isListening) {
    return
  }

  document.addEventListener('keydown', onKeydown)
  isListening = true
}

function stopListening(): void {
  if (!isListening) {
    return
  }

  document.removeEventListener('keydown', onKeydown)
  isListening = false
}

function warnAboutReservedCombos(hotkeys: HotkeyDefinition[]): void {
  for (const hotkey of hotkeys) {
    if (isReservedByBrowser(hotkey.combo)) {
      // eslint-disable-next-line no-console
      console.warn(
        `⌨️  Hotkey "${hotkey.combo}" (${hotkey.description}) is reserved by the browser and will never fire.`
      )
    }
  }
}

/**
 * Declares the shortcuts a component answers to, for as long as it is mounted.
 *
 * They are dropped again when the component's scope goes, so a page's shortcuts
 * leave with the page and nothing has to watch the route to keep the list
 * honest.
 *
 * ```ts
 * useHotkeys(() => [
 *   {
 *     combo: 'mod+s',
 *     description: 'Сохранить работу',
 *     when: () => canSaveWork.value,
 *     allowInEditable: true,
 *     handler: () => (saveChangesModalOpen.value = true)
 *   }
 * ])
 * ```
 */
function useHotkeys(hotkeys: MaybeRefOrGetter<HotkeyDefinition[]>): void {
  const id = nextRegistrationId++

  if (import.meta.env.DEV) {
    warnAboutReservedCombos(toValue(hotkeys))
  }

  registrations.value = [
    ...registrations.value,
    { id, read: () => toValue(hotkeys) }
  ]

  startListening()

  onScopeDispose(() => {
    registrations.value = registrations.value.filter(
      (registration) => registration.id !== id
    )

    if (registrations.value.length === 0) {
      stopListening()
    }
  }, true)
}

/** Reads the shortcuts in force. For the header widget that lists them. */
function useRegisteredHotkeys(): UseRegisteredHotkeysReturn {
  return {
    page: computed(() =>
      registeredHotkeys.value.filter((hotkey) => hotkey.scope === 'page')
    ),
    global: computed(() =>
      registeredHotkeys.value.filter((hotkey) => hotkey.scope === 'global')
    ),
    hasPage: hasPageHotkeys
  }
}

export {
  useHotkeys,
  useRegisteredHotkeys,
  type HotkeyDefinition,
  type HotkeyScope,
  type RegisteredHotkey,
  type UseRegisteredHotkeysReturn
}
