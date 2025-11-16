import { computed, type ComputedRef, type Ref, unref } from 'vue'

/**
 * A marker interface for date separator items inserted into the list.
 */
export interface DateItem {
  id: string
  _type: 'date'
  _date: Date
}

/**
 * A union type for items returned by the composable: either your original item or a DateItem.
 */
export type DatedListItem<T> = Omit<T, keyof DateItem['_date']> | DateItem

/**
 * A source for lists: can be a Ref, ComputedRef, or a getter function returning T[].
 */
export type ListSource<T> = Ref<T[]> | ComputedRef<T[]> | (() => T[])

/**
 * Options for the useDatedList composable.
 * @template T - Type of items in the list. Must include an accessible Date value via getDate.
 */
export interface UseDatedListOptions<T> {
  /**
   *
   */
  list: ListSource<T>
  /**
   * A function to extract a Date object from each item.
   */
  getDate: (item: T) => Date
  /**
   * (Optional) A function to generate unique IDs for DateItem separators.
   * Default: uses timestamp prefix.
   */
  generateId?: (date: Date) => string
}

/**
 * A Vue composable that takes a reactive or computed list of items and returns a computed list
 * with DateItem separators inserted whenever the date changes between adjacent items.
 * Supports Pinia store properties, computed arrays, refs, or plain getter functions.
 *
 * @example
 * const items = ref([{ id: 'a', date: new Date() }, ...]);
 * const storeItems = computed(() => store.records);
 * const customList = () => getDynamicItems();
 * const datedList = useDatedList({
 *   list: storeItems,
 *   getDate: i => i.date,
 * });
 *
 * // datedList.value will be an array containing the original items and DateItem separators.
 *
 * @param list - A reactive source of items (Ref, ComputedRef, or getter function).
 * @param options - Configuration for the composable.
 * @returns A computed ref of the augmented list including DateItem separators.
 */
export function useDatedList<T>(
  options: UseDatedListOptions<T>
): ComputedRef<DatedListItem<T>[]> {
  const { list, getDate, generateId } = options

  // Default ID generator: prefix with timestamp
  const makeId = generateId ?? ((date: Date) => `date-${date.getTime()}`)

  return computed(() => {
    // Resolve list source: function or ref/computed
    const items: T[] = typeof list === 'function' ? list() : unref(list)

    const result: DatedListItem<T>[] = []
    let prevDateKey: number | null = null

    for (const item of items) {
      // Get the raw date from the item
      const date = getDate(item)
      // Normalize to midnight for grouping by day
      const normalized = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
      const dateKey = normalized.getTime()

      if (prevDateKey === null || dateKey !== prevDateKey) {
        // Insert a DateItem separator before items of a new date
        result.push({
          id: makeId(normalized),
          _type: 'date',
          _date: normalized
        })
        prevDateKey = dateKey
      }

      // Push the original item
      result.push(item as DatedListItem<T>)
    }

    return result
  })
}
