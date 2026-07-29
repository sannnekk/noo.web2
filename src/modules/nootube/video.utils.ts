import type {
  NooTubeVideoReactions,
  VideoReaction,
  VideoReactionCounts
} from './api/nootube.types'

/**
 * Applies a reaction toggle the same way the API does: reacting again with the
 * already picked reaction takes it back, any other reaction replaces it.
 *
 * Used to update the reactions optimistically, before the request settles.
 */
export function toggleVideoReaction(
  reactions: NooTubeVideoReactions,
  reaction: VideoReaction
): NooTubeVideoReactions {
  const isTakenBack = reactions.myReaction === reaction
  const counts: VideoReactionCounts = { ...reactions.counts }

  if (reactions.myReaction) {
    counts[reactions.myReaction] = Math.max(
      0,
      (counts[reactions.myReaction] ?? 0) - 1
    )
  }

  if (!isTakenBack) {
    counts[reaction] = (counts[reaction] ?? 0) + 1
  }

  return {
    myReaction: isTakenBack ? null : reaction,
    counts
  }
}

/**
 * A piece of comment text: either plain text or a timestamp pointing at a
 * position in the video.
 */
export type CommentSegment =
  | { type: 'text'; value: string }
  | { type: 'timestamp'; value: string; seconds: number }

/**
 * Matches `m:ss` and `h:mm:ss` timestamps. Both sides are guarded so that
 * longer digit runs (`1234:56`, `12:345`) are left alone.
 */
const TIMESTAMP_PATTERN = /\b(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)(?!\d)/g

/**
 * Splits comment text into plain text and the timestamps found in it, so a
 * comment can render the timestamps as controls that seek the player.
 *
 * Adjacent text is never merged away: concatenating every segment's `value`
 * yields the original text back.
 */
export function parseCommentSegments(content: string): CommentSegment[] {
  const segments: CommentSegment[] = []
  let lastIndex = 0

  for (const match of content.matchAll(TIMESTAMP_PATTERN)) {
    const [value, hours, minutes, seconds] = match

    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: content.slice(lastIndex, match.index)
      })
    }

    segments.push({
      type: 'timestamp',
      value,
      seconds:
        Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(seconds)
    })

    lastIndex = match.index + value.length
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return segments
}

/**
 * Formats a video duration given in seconds as `h:mm:ss` (the hours segment is
 * omitted when zero). Returns a placeholder for unknown or negative durations.
 */
export function formatVideoDuration(length: number | null): string {
  if (length === null || length < 0) {
    return '--:--'
  }

  const hours = Math.floor(length / 3600)
  const minutes = Math.floor((length % 3600) / 60)
  const seconds = length % 60

  return `${hours ? hours + ':' : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
