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
  gap: var(--space-s)
  padding: var(--space-2xs) 0
  flex-wrap: wrap
  margin: 0 var(--space-2xs)

  &__list
    display: flex
    flex-wrap: wrap
    gap: var(--space-s)
    align-items: flex-start

    +mobile
      flex: 1 1 100%
      gap: var(--space-2xs)

      > *
        flex: 1 1 100%
        min-width: 0

  &__actions
    // Lines the buttons up with the inputs, which carry a label above them.
    padding-top: var(--space-s)
    display: flex
    align-items: center
    gap: var(--space-2xs)

    +mobile
      flex: 1 1 100%
      flex-wrap: wrap
      justify-content: flex-end
      padding-top: 0
</style>
