import { describe, expect, test } from 'vitest'
import {
  commentColor,
  isRectUsable,
  normalizeRect
} from './richtext-comment.utils'

describe('richtext comment rectangles', () => {
  describe('normalizeRect', () => {
    test('should build a rectangle from two corners in any order', () => {
      const dragged = normalizeRect({ x: 0.6, y: 0.8 }, { x: 0.2, y: 0.3 })

      expect(dragged.x).toBeCloseTo(0.2)
      expect(dragged.y).toBeCloseTo(0.3)
      expect(dragged.width).toBeCloseTo(0.4)
      expect(dragged.height).toBeCloseTo(0.5)
    })

    test('should clamp a drag that left the image to its box', () => {
      const dragged = normalizeRect({ x: -0.5, y: 0.5 }, { x: 1.4, y: 2 })

      expect(dragged).toEqual({ x: 0, y: 0.5, width: 1, height: 0.5 })
    })
  })

  describe('isRectUsable', () => {
    test('should reject what is really a click rather than a region', () => {
      expect(isRectUsable({ x: 0.5, y: 0.5, width: 0, height: 0 })).toBe(false)
      expect(isRectUsable({ x: 0.5, y: 0.5, width: 0.4, height: 0.001 })).toBe(
        false
      )
    })

    test('should accept a region big enough to point at something', () => {
      expect(isRectUsable({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 })).toBe(
        true
      )
    })
  })

  describe('commentColor', () => {
    const types = [{ key: 'factual', label: 'Фактическая', color: 'red' }]

    test('should find the colour of a known type', () => {
      expect(commentColor(types, 'factual')).toBe('red')
    })

    test('should return nothing for a type the caller does not offer', () => {
      expect(commentColor(types, 'logical')).toBeUndefined()
      expect(commentColor(types, null)).toBeUndefined()
    })
  })
})
