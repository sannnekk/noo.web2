import { reviveDates } from '../api/serialization.utils'

/**
 * Every key this module writes is namespaced, so `clear()` and `prune()` can
 * never touch something another script put on the same origin. The namespace is
 * shared with other parts of the app that reach for storage on their own (the
 * theme, for one), so belonging to it is necessary but not sufficient: only
 * records written as an {@link StorageRecord} envelope are ours to sweep.
 */
const KEY_PREFIX = 'noo.'

/**
 * The envelope a value is stored in: the value itself plus the moment it goes
 * stale, so an expiry survives a page reload.
 */
interface StorageRecord<T> {
  value: T
  /** Epoch milliseconds after which the record is stale, `null` if it never is. */
  expiresAt: number | null
}

interface SetOptions {
  /**
   * Lifetime in milliseconds, counted from now. Without it the record is kept
   * until something removes it.
   */
  ttl?: number
}

interface GetOptions {
  /**
   * Turn ISO date strings back into `Date` objects, the way API responses are
   * revived. Off by default: it cannot tell a date from a string that merely
   * looks like one.
   */
  withDates?: boolean
}

function withPrefix(key: string): string {
  return key.startsWith(KEY_PREFIX) ? key : `${KEY_PREFIX}${key}`
}

/**
 * Storage is a privilege, not a given: it is missing when rendered outside a
 * browser and throws when a user blocks it or the quota is exhausted. Every
 * access below goes through here so a failure degrades into "no draft" instead
 * of a broken page.
 */
function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isRecord<T>(candidate: unknown): candidate is StorageRecord<T> {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    'value' in candidate &&
    'expiresAt' in candidate
  )
}

function readRecord<T>(
  key: string,
  { withDates = false }: GetOptions = {}
): StorageRecord<T> | null {
  const storage = getStorage()
  const raw = storage?.getItem(withPrefix(key))

  if (!raw) {
    return null
  }

  try {
    const record: unknown = JSON.parse(raw, withDates ? reviveDates : undefined)

    return isRecord<T>(record) ? record : null
  } catch {
    return null
  }
}

function isExpired(record: StorageRecord<unknown>): boolean {
  return record.expiresAt !== null && record.expiresAt <= Date.now()
}

function set<T>(key: string, value: T, { ttl }: SetOptions = {}): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const record: StorageRecord<T> = {
    value,
    expiresAt: ttl === undefined ? null : Date.now() + ttl
  }

  try {
    storage.setItem(withPrefix(key), JSON.stringify(record))
  } catch {
    // A full or read-only storage is not worth failing a user action over.
  }
}

/**
 * Reads a value back. An expired record is dropped and reads as missing, so a
 * stale draft never has to be filtered out by the caller.
 */
function get<T>(key: string, options: GetOptions = {}): T | undefined {
  const record = readRecord<T>(key, options)

  if (!record) {
    return undefined
  }

  if (isExpired(record)) {
    remove(key)

    return undefined
  }

  return record.value
}

function isSet(key: string): boolean {
  return get(key) !== undefined
}

function remove(key: string): void {
  try {
    getStorage()?.removeItem(withPrefix(key))
  } catch {
    // See `set()`.
  }
}

/**
 * Every record this module wrote, in stored (prefixed) key form. Namespaced
 * keys holding anything other than an envelope belong to somebody else and are
 * left out.
 */
function ownRecords(): { key: string; record: StorageRecord<unknown> }[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    return Object.keys(storage)
      .filter((key) => key.startsWith(KEY_PREFIX))
      .map((key) => ({ key, record: readRecord(key) }))
      .filter(
        (entry): entry is { key: string; record: StorageRecord<unknown> } =>
          entry.record !== null
      )
  } catch {
    return []
  }
}

/**
 * Drops every expired record. Worth calling on boot: records only expire lazily
 * on read, so a key nobody reads again would otherwise stay forever.
 */
function prune(): void {
  for (const { key, record } of ownRecords()) {
    if (isExpired(record)) {
      remove(key)
    }
  }
}

/**
 * Drops everything this module stored. Meant for the end of a session: whatever
 * was kept for the person leaving must not be there for the next one.
 */
function clear(): void {
  for (const { key } of ownRecords()) {
    remove(key)
  }
}

export const LocalStorage = {
  get,
  set,
  isSet,
  remove,
  prune,
  clear,
  KEY_PREFIX
}

export type { GetOptions, SetOptions, StorageRecord }
