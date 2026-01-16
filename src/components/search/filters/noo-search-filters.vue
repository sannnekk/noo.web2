<template>
  <div class="noo-search-filters">
    <div class="noo-search-filters__list">
      <slot />
    </div>
    <div class="noo-search-filters__actions">
      <slot name="actions" />
      <noo-button
        v-if="hasFilters"
        variant="inline"
        size="small"
        @click="clearFilters"
      >
        Сбросить фильтры
      </noo-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFilter } from '@/core/utils/pagination.utils'
import { computed } from 'vue'

const filtersModel = defineModel<IFilter[] | undefined>('filters', {
  default: undefined
})

const hasFilters = computed(() => (filtersModel.value?.length ?? 0) > 0)

function clearFilters() {
  filtersModel.value = []
}
</script>

<style scoped lang="sass">
.noo-search-filters
  display: flex
  align-items: flex-start
  justify-content: space-between
  gap: 1em
  padding: 0.5em 0
  flex-wrap: wrap
  margin: 0 0.5em

  &__list
    display: flex
    flex-wrap: wrap
    gap: 1em
    align-items: flex-start

  &__actions
    padding-top: 1em
    display: flex
    align-items: center
    gap: 0.5em
</style>
