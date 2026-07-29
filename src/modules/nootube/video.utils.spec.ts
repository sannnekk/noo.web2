import { describe, expect, test } from 'vitest'
import type { NooTubeVideoReactions } from './api/nootube.types'
import {
  formatVideoDuration,
  parseCommentSegments,
  toggleVideoReaction
} from './video.utils'

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

describe('parseCommentSegments', () => {
  test('leaves text without timestamps in one segment', () => {
    expect(parseCommentSegments('Отличное видео!')).toEqual([
      { type: 'text', value: 'Отличное видео!' }
    ])
  })

  test('reads m:ss as minutes and seconds', () => {
    expect(parseCommentSegments('1:23')).toEqual([
      { type: 'timestamp', value: '1:23', seconds: 83 }
    ])
  })

  test('reads h:mm:ss as hours, minutes and seconds', () => {
    expect(parseCommentSegments('2:03:04')).toEqual([
      { type: 'timestamp', value: '2:03:04', seconds: 7384 }
    ])
  })

  test('keeps the text around a timestamp', () => {
    expect(parseCommentSegments('Смотрите с 10:30 — там объяснение')).toEqual([
      { type: 'text', value: 'Смотрите с ' },
      { type: 'timestamp', value: '10:30', seconds: 630 },
      { type: 'text', value: ' — там объяснение' }
    ])
  })

  test('finds every timestamp in a comment', () => {
    const segments = parseCommentSegments('0:15 вступление, 4:20 разбор')

    expect(segments.filter((segment) => segment.type === 'timestamp')).toEqual([
      { type: 'timestamp', value: '0:15', seconds: 15 },
      { type: 'timestamp', value: '4:20', seconds: 260 }
    ])
  })

  test.each(['1234:56', '12:345', '99:99', 'v1:23'])(
    'leaves %s alone',
    (content) => {
      expect(parseCommentSegments(content)).toEqual([
        { type: 'text', value: content }
      ])
    }
  )

  test('preserves the original text across all segments', () => {
    const content = 'C 1:23 до 2:00:00, потом 45:00 ещё раз'

    const joined = parseCommentSegments(content)
      .map((segment) => segment.value)
      .join('')

    expect(joined).toBe(content)
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
