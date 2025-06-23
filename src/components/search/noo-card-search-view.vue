<template>
  <div class="noo-card-search-view">
    <div class="noo-card-search-view__head">
      <div class="noo-card-search-view__head__search-input">
        <noo-search-input
          v-model="searchModel"
          :is-loading="isLoading"
        />
      </div>
      <div class="noo-card-search-view__head__actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="noo-card-search-view__above-content">
      <slot name="above-content" />
    </div>
    <div
      v-if="isLoading"
      class="noo-card-search-view__is-loading"
    >
      <noo-loader-icon contrast />
    </div>
    <div
      v-else-if="items?.length"
      class="noo-card-search-view__content"
      :style="{
        gridGap: gap,
        padding: gap,
        gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))`
      }"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="noo-card-search-view__content__tile"
      >
        <slot
          name="tile"
          :item="item"
        />
      </div>
    </div>
    <div
      v-else
      class="noo-card-search-view__empty"
    >
      <slot name="empty">
        <div class="noo-card-search-view__empty__inner">
          <noo-not-found-image />
          <noo-title
            :size="4"
            align="center"
          >
            Ничего не найдено
          </noo-title>
          <noo-text-block
            align="center"
            size="medium"
            dimmed
          >
            Попробуйте изменить параметры поиска
          </noo-text-block>
        </div>
      </slot>
    </div>
    <div class="noo-card-search-view__footer">
      <noo-pagination
        v-model:page="pageModel"
        :total="totalCount"
        :limit="limit ?? 25"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends ApiEntity">
import type { ApiEntity } from '@/core/api/api.types'

export interface Props<T extends ApiEntity> {
  items: T[]
  totalCount: number
  limit?: number
  isLoading?: boolean
  gap?: string
  /**
   * Number of tiles per row in the grid.
   * Can be 2 to 6.
   * Default is 3.
   */
  perRow?: number
}

withDefaults(defineProps<Props<T>>(), {
  limit: 25,
  isLoading: false,
  perRow: 3,
  gap: '0.5em'
})

const searchModel = defineModel<string>('search', {
  default: ''
})
const pageModel = defineModel<number>('page', {
  default: 1
})
</script>

<style scoped lang="sass">
.noo-card-search-view
  &__head
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5em
    padding: 0 0.5em

    &__search-input
      flex: 0.75

    &__actions
      display: flex
      justify-content: flex-end
      gap: 0.5em

  &__content
    display: grid

  &__empty
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    padding: 4em 1em

    &__inner
      text-align: center
      width: max(600px, 90%)
</style>
