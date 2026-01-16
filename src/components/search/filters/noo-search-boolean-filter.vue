<template>
  <div class="noo-search-boolean-filter">
    <noo-select-input
      v-model="selected"
      :label="label"
      :options="selectOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { EqualsFilter, type IFilter } from '@/core/utils/pagination.utils'
import { computed, nextTick, ref, watch } from 'vue'
import {
  type FilterCtor,
  findFilterOfType,
  setFilter
} from './search-filters.utils'

interface Props {
  label: string
  filterKey: string
  anyLabel?: string
  trueLabel?: string
  falseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  anyLabel: 'Все',
  trueLabel: 'Да',
  falseLabel: 'Нет'
})

const filtersModel = defineModel<IFilter[] | undefined>('filters', {
  default: undefined
})

const selected = ref<boolean | null>(null)

const selectOptions = computed(() => [
  { label: props.anyLabel, value: null },
  { label: props.trueLabel, value: true },
  { label: props.falseLabel, value: false }
])

let isSyncing = false

watch(
  () => filtersModel.value,
  (filters) => {
    const current = findFilterOfType(
      filters,
      props.filterKey,
      EqualsFilter as FilterCtor<EqualsFilter<boolean>>
    )

    isSyncing = true

    selected.value = current?.getValue() ?? null

    nextTick(() => {
      isSyncing = false
    })
  },
  { immediate: true, deep: true }
)

watch(
  () => selected.value,
  (value) => {
    if (isSyncing) {
      return
    }

    if (value === null) {
      filtersModel.value = setFilter(filtersModel.value, props.filterKey, null)

      return
    }

    filtersModel.value = setFilter(
      filtersModel.value,
      props.filterKey,
      new EqualsFilter(props.filterKey, value)
    )
  }
)
</script>

<style scoped lang="sass">
.noo-search-boolean-filter
  min-width: 200px
</style>
