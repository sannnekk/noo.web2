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
        '--grid-gap': gap,
        '--per-row': perRow,
        '--tile-min-width': tileMinWidth
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
      v-else-if="!error"
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
    <div
      v-else
      class="noo-card-search__error"
    >
      <noo-error-block
        with-image
        centered
        :try-again="tryAgain"
      >
        <noo-title :size="4">
          {{
            error
              ? `${error.name}: ${error.description}`
              : 'Не удалось получить результаты поиска'
          }}
        </noo-title>
      </noo-error-block>
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

<script
  setup
  lang="ts"
  generic="T extends ApiEntity<TName>, TName extends string = T['_entityName']"
>
import type { ApiEntity } from '@/core/api/api.types'
import type { ApiError } from '@/core/api/api.utils'

export interface Props<
  T extends ApiEntity<TName>,
  TName extends string = T['_entityName']
> {
  items: T[]
  totalCount: number
  limit?: number
  isLoading?: boolean
  gap?: string
  /**
   * Maximum number of tiles per row, reached on wide viewports.
   * Can be 2 to 6. Default is 3.
   *
   * The grid drops to fewer columns on its own once a tile would get
   * narrower than `tileMinWidth`, so this is a ceiling and not a fixed count.
   */
  perRow?: number
  /**
   * Narrowest a tile is allowed to get before the grid drops a column.
   */
  tileMinWidth?: string
  error?: ApiError | null
  tryAgain?: () => void
}

withDefaults(defineProps<Props<T>>(), {
  limit: 25,
  isLoading: false,
  perRow: 3,
  gap: '0.5em',
  tileMinWidth: '18rem'
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
    display: grid
    gap: var(--grid-gap)
    padding: var(--grid-gap)
    // Tracks never go below --tile-min-width, so auto-fill drops columns on its
    // own; the calc() caps the count at --per-row when there is room to spare.
    // auto-fill (not auto-fit) keeps the unfilled tracks, so a partial last row
    // — or a single result — keeps the tile width instead of stretching.
    grid-template-columns: repeat(auto-fill, minmax(min(100%, max(var(--tile-min-width), calc((100% - (var(--per-row) - 1) * var(--grid-gap)) / var(--per-row)))), 1fr))

  &__is-loading
    display: flex
    align-items: center
    justify-content: center
    padding: var(--space-2xl) var(--space-s)
    font-size: fluid(2rem, 3rem)

  &__empty
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    padding: var(--space-2xl) var(--space-s)

    &__inner
      text-align: center
      width: min(max(600px, 90%), 100%)

      img
        max-width: 50%
</style>
