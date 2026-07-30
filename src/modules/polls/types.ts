import type { ViewMode } from '@/core/composables/useViewMode'

export type PollViewMode = ViewMode

/**
 * A user-facing group of MIME types allowed as an answer to a `files` question.
 * The API stores plain MIME types, see `pollFileTypeGroups` for the mapping.
 */
export type PollFileTypeGroup = 'images' | 'documents'
