import type { RichtextComment, RichtextCommentType } from './extensions/comment'

/**
 * A region of an image, as fractions of its rendered box. Fractions rather than
 * pixels so a comment keeps pointing at the same part of the picture whatever
 * size it is displayed at.
 */
export interface RichtextRect {
  x: number
  y: number
  width: number
  height: number
}

/** A comment attached to a rectangle inside an image. */
export type RichtextImageComment = RichtextComment & RichtextRect

/** Below this, in either axis, a drag reads as a stray click rather than a box. */
const minRectSize = 0.02

/**
 * Builds a rectangle from the two corners a drag produced, in either order and
 * possibly outside the image, and clamps it to the image box.
 */
export function normalizeRect(
  start: { x: number; y: number },
  end: { x: number; y: number }
): RichtextRect {
  const left = clampFraction(Math.min(start.x, end.x))
  const top = clampFraction(Math.min(start.y, end.y))

  return {
    x: left,
    y: top,
    width: clampFraction(Math.max(start.x, end.x)) - left,
    height: clampFraction(Math.max(start.y, end.y)) - top
  }
}

export function isRectUsable(rect: RichtextRect): boolean {
  return rect.width >= minRectSize && rect.height >= minRectSize
}

export function commentColor(
  types: RichtextCommentType[],
  key: string | null | undefined
): string | undefined {
  return types.find((type) => type.key === key)?.color
}

function clampFraction(value: number): number {
  return Math.min(1, Math.max(0, value))
}
