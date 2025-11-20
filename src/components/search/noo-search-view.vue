<template>
  <div class="noo-search-view">
    <div class="noo-search-view__head">
      <div class="noo-search-view__head__search-input">
        <noo-search-input
          v-model="searchModel"
          :is-loading="isLoading"
        />
      </div>
      <div class="noo-search-view__head__actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="noo-search-view__above-content">
      <slot name="above-content" />
    </div>
    <div class="noo-search-view__content">
      <noo-entity-table
        :data="items"
        :columns="columns"
        :is-loading="isLoading"
        :row-link="rowLink"
      >
        <template
          v-for="column in columns"
          :key="column.key"
          #[`column-${String(column.key)}`]="{ item }"
        >
          <slot
            :name="`column-${String(column.key)}`"
            :item="item"
            :column="column"
          />
        </template>
      </noo-entity-table>
    </div>
    <div class="noo-search-view__footer">
      <noo-pagination
        v-model:page="pageModel"
        :total="totalCount"
        :limit="limit ?? 25"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="T extends ApiEntity<TName>, TName extends string = T['_entityName']"
>
import type { ApiEntity } from '@/core/api/api.types'
import type { RouteLocationAsRelativeGeneric } from 'vue-router'
import type { EntityTableColumnType } from '../entity-table/entity-table-helpers'

export interface Props<
  T extends ApiEntity<TName>,
  TName extends string = T['_entityName']
> {
  items: T[]
  totalCount: number
  limit?: number
  isLoading?: boolean
  columns: EntityTableColumnType<T>[]
  rowLink?: (item: T) => RouteLocationAsRelativeGeneric
}

defineProps<Props<T>>()

const searchModel = defineModel<string>('search', {
  default: ''
})
const pageModel = defineModel<number>('page', {
  default: 1
})
</script>

<style scoped lang="sass">
.noo-search-view
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
      gap: 0.5rem

  &__content
    padding: 1em 0
</style>
