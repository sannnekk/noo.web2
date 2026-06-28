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
