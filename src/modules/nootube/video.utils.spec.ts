import { describe, expect, test } from 'vitest'
import type { NooTubeVideoReactions } from './api/nootube.types'
import { formatVideoDuration, toggleVideoReaction } from './video.utils'

function reactions(
  overrides: Partial<NooTubeVideoReactions> = {}
): NooTubeVideoReactions {
  return {
    myReaction: null,
    counts: {},
    ...overrides
  }
}

describe('toggleVideoReaction', () => {
  test('adds a reaction the user did not have yet', () => {
    const result = toggleVideoReaction(
      reactions({ counts: { like: 2 } }),
      'like'
    )

    expect(result).toEqual({ myReaction: 'like', counts: { like: 3 } })
  })

  test('counts a reaction nobody picked before', () => {
    const result = toggleVideoReaction(reactions(), 'heart')

    expect(result).toEqual({ myReaction: 'heart', counts: { heart: 1 } })
  })

  test('takes the reaction back when it is picked again', () => {
    const result = toggleVideoReaction(
      reactions({ myReaction: 'sad', counts: { sad: 4 } }),
      'sad'
    )

    expect(result).toEqual({ myReaction: null, counts: { sad: 3 } })
  })

  test('moves the count over when another reaction is picked', () => {
    const result = toggleVideoReaction(
      reactions({ myReaction: 'like', counts: { like: 1, laugh: 5 } }),
      'laugh'
    )

    expect(result).toEqual({
      myReaction: 'laugh',
      counts: { like: 0, laugh: 6 }
    })
  })

  test('never lets a count fall below zero', () => {
    const result = toggleVideoReaction(
      reactions({ myReaction: 'like', counts: {} }),
      'dislike'
    )

    expect(result).toEqual({
      myReaction: 'dislike',
      counts: { like: 0, dislike: 1 }
    })
  })

  test('leaves the source object untouched', () => {
    const source = reactions({ myReaction: 'like', counts: { like: 1 } })

    toggleVideoReaction(source, 'sad')

    expect(source).toEqual({ myReaction: 'like', counts: { like: 1 } })
  })
})

describe('formatVideoDuration', () => {
  test.each([
    [null, '--:--'],
    [-1, '--:--'],
    [0, '00:00'],
    [61, '01:01'],
    [3661, '1:01:01']
  ])('formats %s as %s', (length, expected) => {
    expect(formatVideoDuration(length)).toBe(expected)
  })
})
