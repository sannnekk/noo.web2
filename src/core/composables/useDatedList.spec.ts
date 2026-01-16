import { describe, expect, test } from 'vitest'
import { computed, ref } from 'vue'
import { useDatedList, type DateItem } from './useDatedList'

describe('useDatedList', () => {
  test('inserts date separators when day changes', () => {
    const items = ref([
      { id: 'a', date: new Date('2024-01-01T10:00:00.000Z') },
      { id: 'b', date: new Date('2024-01-01T12:00:00.000Z') },
      { id: 'c', date: new Date('2024-01-02T09:00:00.000Z') }
    ])

    const datedList = useDatedList({
      list: items,
      getDate: (item) => item.date
    })

    const result = datedList.value

    expect(result).toHaveLength(5)
    expect((result[0] as DateItem)._type).toBe('date')
    expect(result[1]).toEqual(items.value[0])
    expect(result[2]).toEqual(items.value[1])
    expect((result[3] as DateItem)._type).toBe('date')
    expect(result[4]).toEqual(items.value[2])
  })

  test('supports computed list source', () => {
    const items = ref([{ id: 'a', date: new Date('2024-01-01T10:00:00.000Z') }])
    const listSource = computed(() => items.value)

    const datedList = useDatedList({
      list: listSource,
      getDate: (item) => item.date
    })

    expect(datedList.value).toHaveLength(2)
  })

  test('uses custom id generator', () => {
    const items = ref([{ id: 'a', date: new Date('2024-01-01T10:00:00.000Z') }])

    const datedList = useDatedList({
      list: items,
      getDate: (item) => item.date,
      generateId: (date) => `custom-${date.getTime()}`
    })

    const first = datedList.value[0] as DateItem

    expect(first.id.startsWith('custom-')).toBe(true)
  })

  test('returns empty list when source is empty', () => {
    const items = ref<{ id: string; date: Date }[]>([])

    const datedList = useDatedList({
      list: items,
      getDate: (item) => item.date
    })

    expect(datedList.value).toEqual([])
  })
})
