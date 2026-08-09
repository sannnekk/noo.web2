<template>
  <div class="noo-search-view">
    <div
      v-if="withSearch || $slots.actions"
      class="noo-search-view__head"
    >
      <div
        v-if="withSearch"
        class="noo-search-view__head__search-input"
      >
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
        :error="error"
        :try-again="tryAgain"
        :actions="actions"
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
import type { RowAction } from '../entity-table/noo-entity-table.vue'
import type { ApiError } from '@/core/api/api.utils'

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
  error?: ApiError | null
  tryAgain?: () => void
  actions?: RowAction<T>[]
  /**
   * Set to false for lists that have nothing free-text to match on and are
   * narrowed by filters alone. Needs an explicit default: an absent boolean prop
   * is cast to false, not undefined, which would hide the input everywhere the
   * prop is omitted.
   */
  withSearch?: boolean
}

withDefaults(defineProps<Props<T>>(), {
  withSearch: true
})

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
    gap: var(--space-2xs)
    padding: 0 var(--space-2xs)
    flex-wrap: wrap

    &__search-input
      flex: 0.75 1 16rem

    &__actions
      display: flex
      justify-content: flex-end
      gap: var(--space-2xs)

      +mobile
        flex: 1 1 100%
        flex-wrap: wrap

  &__content
    padding: var(--space-s) 0
    // The table has a minimum width no amount of stacking removes — it scrolls
    // itself so the page does not scroll sideways.
    +scroll-x
</style>
