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
