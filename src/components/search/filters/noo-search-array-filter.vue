<template>
  <div class="search-array-filter">
    <div
      v-if="filter.arrayOptions && model && !isLoading"
      class="search-array-filter__body"
    >
      <check-list
        v-model="(model as any)"
        item-label-key="label"
        item-key="value"
        :items="options"
        multiple
      />
    </div>
    <div
      v-else
      class="search-array-filter__loading"
    >
      <loader-icon contrast />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilterType } from '@/core/data/Pagination'
import type { SearchFilter } from './SearchFilter'
import { computed, ref, watch } from 'vue'

interface Props {
  filter: SearchFilter
  modelValue: FilterType['value']
}

type Emits = (event: 'update:modelValue', value: FilterType['value']) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => { emits('update:modelValue', value); }
})

const isLoading = ref(false)

const options = ref<{ label: string; value: any }[]>([])

watch(
  () => props.filter.arrayOptions,
  async (arrayOptions) => {
    isLoading.value = true

    if (typeof arrayOptions === 'function') {
      options.value = await arrayOptions()
    } else {
      options.value = arrayOptions!
    }

    isLoading.value = false
  },
  { immediate: true }
)
</script>

<style scoped lang="sass">
.search-array-filter
	display: block
	font-size: 0.8em
</style>
