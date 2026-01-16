<template>
  <div class="noo-search-enum-filter">
    <noo-multi-select
      v-if="multiple"
      v-model="selectedMultipleModel"
      :label="label"
      :options="multiOptions"
      expandable
    />
    <noo-select-input
      v-else
      v-model="selectedModel"
      :label="label"
      :options="selectOptions"
    />
  </div>
</template>

<script setup lang="ts" generic="TValue extends string">
import {
  ArrayFilter,
  EqualsFilter,
  type IFilter
} from '@/core/utils/pagination.utils'
import { computed, nextTick, ref, watch } from 'vue'
import {
  type FilterCtor,
  findFilterOfType,
  setFilter
} from './search-filters.utils'

interface Props {
  label: string
  filterKey: string
  options: { label: string; value: TValue }[]
  multiple?: boolean
  anyLabel?: string
  includeAny?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  anyLabel: 'Все',
  includeAny: true,
  multiple: false
})

const filtersModel = defineModel<IFilter[] | undefined>('filters', {
  default: undefined
})

const selectedValue = ref<TValue | null>(null)
const selectedMultipleModel = ref<string[]>([])

const optionLookup = computed(
  () =>
    new Map(props.options.map((option) => [String(option.value), option.value]))
)

const selectedModel = computed<string | null>({
  get: () =>
    selectedValue.value === null ? null : String(selectedValue.value),
  set: (value) => {
    selectedValue.value = value ? (optionLookup.value.get(value) ?? null) : null
  }
})

const selectOptions = computed(() => {
  const options = props.options.map((option) => ({
    label: option.label,
    value: String(option.value)
  }))

  if (props.includeAny && !props.multiple) {
    return [{ label: props.anyLabel, value: null }, ...options]
  }

  return options
})

const multiOptions = computed(() =>
  props.options.map((option) => ({
    label: option.label,
    value: String(option.value)
  }))
)

let isSyncing = false

watch(
  () => filtersModel.value,
  (filters) => {
    isSyncing = true

    if (props.multiple) {
      const current = findFilterOfType(
        filters,
        props.filterKey,
        ArrayFilter as FilterCtor<ArrayFilter<TValue>>
      )

      selectedMultipleModel.value =
        current?.getValue().map((value) => String(value)) ?? []
    } else {
      const current = findFilterOfType(
        filters,
        props.filterKey,
        EqualsFilter as FilterCtor<EqualsFilter<TValue>>
      )

      selectedValue.value = current?.getValue() ?? null
    }

    nextTick(() => {
      isSyncing = false
    })
  },
  { immediate: true, deep: true }
)

watch(
  () => selectedValue.value,
  (value) => {
    if (isSyncing) {
      return
    }

    if (props.multiple) {
      return
    }

    if (!value) {
      filtersModel.value = setFilter(filtersModel.value, props.filterKey, null)

      return
    }

    filtersModel.value = setFilter(
      filtersModel.value,
      props.filterKey,
      new EqualsFilter<TValue>(props.filterKey, value)
    )
  }
)

watch(
  () => selectedMultipleModel.value,
  (value) => {
    if (isSyncing) {
      return
    }

    if (!props.multiple) {
      return
    }

    if (!value.length) {
      filtersModel.value = setFilter(filtersModel.value, props.filterKey, null)

      return
    }

    const mapped = value
      .map((entry) => optionLookup.value.get(entry))
      .filter((entry): entry is TValue => Boolean(entry))

    if (!mapped.length) {
      filtersModel.value = setFilter(filtersModel.value, props.filterKey, null)

      return
    }

    filtersModel.value = setFilter(
      filtersModel.value,
      props.filterKey,
      new ArrayFilter<TValue>(props.filterKey, mapped)
    )
  },
  { deep: true }
)
</script>

<style scoped lang="sass">
.noo-search-enum-filter
</style>
