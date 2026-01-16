<template>
  <div class="noo-search-range-filter">
    <div class="noo-search-range-filter__inputs">
      <noo-date-input
        v-model="startDate"
        :label="fromLabel"
        :type="type"
      />
      <noo-date-input
        v-model="endDate"
        :label="toLabel"
        :type="type"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RangeFilter, type IFilter } from '@/core/utils/pagination.utils'
import { nextTick, ref, watch } from 'vue'
import {
  findFilterOfType,
  setFilter,
  type FilterCtor
} from './search-filters.utils'

interface Props {
  filterKey: string
  type?: 'date' | 'datetime-local' | 'month' | 'week'
  fromLabel?: string
  toLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'date',
  fromLabel: 'С',
  toLabel: 'По'
})

const filtersModel = defineModel<IFilter[] | undefined>('filters', {
  default: undefined
})

const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)

let isSyncing = false

watch(
  () => filtersModel.value,
  (filters) => {
    const current = findFilterOfType(
      filters,
      props.filterKey,
      RangeFilter as FilterCtor<RangeFilter<Date>>
    )

    isSyncing = true

    if (!current) {
      startDate.value = null
      endDate.value = null
    } else {
      const range = current.getValue()

      startDate.value = normalizeDate(range?.min ?? null)
      endDate.value = normalizeDate(range?.max ?? null)
    }

    nextTick(() => {
      isSyncing = false
    })
  },
  { immediate: true, deep: true }
)

watch(
  [startDate, endDate],
  ([start, end]) => {
    if (isSyncing) {
      return
    }

    if (!start && !end) {
      filtersModel.value = setFilter(filtersModel.value, props.filterKey, null)

      return
    }

    filtersModel.value = setFilter(
      filtersModel.value,
      props.filterKey,
      new RangeFilter(props.filterKey, start ?? null, end ?? null)
    )
  },
  { immediate: false }
)

function normalizeDate(value: Date | string | number | null): Date | null {
  if (!value) {
    return null
  }

  return value instanceof Date ? value : new Date(value)
}
</script>

<style scoped lang="sass">
.noo-search-range-filter
  display: flex
  flex-direction: column
  gap: 0.35em
  min-width: 260px

  &__inputs
    display: grid
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: 0.5em
</style>
