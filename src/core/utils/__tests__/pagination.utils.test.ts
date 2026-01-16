import { describe, expect, it } from 'vitest'
import {
  ArrayFilter,
  EqualsFilter,
  Pagination,
  RangeFilter
} from '../pagination.utils'

describe('pagination.utils', () => {
  it('builds AutoFilterer pagination and sorting params', () => {
    const pagination = new Pagination(2, 20, 'title', 'Ascending')

    const params = pagination.toQuery()

    expect(params.get('page')).toBe('2')
    expect(params.get('perPage')).toBe('20')
    expect(params.get('sort')).toBe('title')
    expect(params.get('sortBy')).toBe('Ascending')
  })

  it('serializes equals, range, and array filters', () => {
    const start = new Date('2024-01-01T00:00:00.000Z')
    const end = new Date('2024-01-31T23:59:59.000Z')

    const pagination = new Pagination(1, 10, undefined, undefined, [
      new EqualsFilter('status', 'active'),
      new RangeFilter('createdAt', start, end),
      new ArrayFilter('tags', ['a', 'b'])
    ])

    const params = pagination.toQuery()

    expect(params.get('status')).toBe('active')
    expect(params.get('createdAt.Min')).toBe(start.toISOString())
    expect(params.get('createdAt.Max')).toBe(end.toISOString())
    expect(params.getAll('tags')).toEqual(['a', 'b'])
  })

  it('omits empty range values and trims search', () => {
    const pagination = new Pagination(
      1,
      10,
      undefined,
      undefined,
      [new RangeFilter('score', null, 100)],
      '  hello  '
    )

    const params = pagination.toQuery()

    expect(params.has('score.Min')).toBe(false)
    expect(params.get('score.Max')).toBe('100')
    expect(params.get('search')).toBe('hello')
  })
})
