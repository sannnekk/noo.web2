/**
 * The kind of change an entry describes. Mirrors the API's `ChangeType` enum,
 * which is serialized in hyphen-lowercase.
 */
export type PlatformChangeType =
  'feature' | 'bug-fix' | 'optimization' | 'refactor'

export interface PlatformChange {
  type: PlatformChangeType
  author: string
  description: string
}

export interface ChangelogRelease {
  version: string
  date: Date
  changes: PlatformChange[]
}
