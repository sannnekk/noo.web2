<template>
  <table
    v-if="props.data !== null && props.data?.length"
    class="noo-entity-table"
  >
    <thead class="noo-entity-table__head">
      <tr>
        <th
          v-for="column in props.columns"
          :key="column.key"
        >
          {{ column.title }}
        </th>
      </tr>
    </thead>
    <tbody
      v-if="!props.isLoading"
      class="noo-entity-table__content"
    >
      <tr
        v-for="item in props.data"
        :key="item.id"
        class="noo-entity-table__content__row"
        :class="{ 'noo-entity-table__content__row--is-link': props.rowLink }"
      >
        <td
          v-for="column in props.columns"
          :key="column.key"
          :style="column.width ? { width: column.width } : {}"
          class="noo-entity-table__content__row__cell"
        >
          <component
            :is="rowLink && !column.disableLink ? 'router-link' : 'div'"
            :to="rowLink ? rowLink(item) : undefined"
            class="noo-entity-table__content__row__cell__link"
          >
            <slot
              :name="`column-${String(column.key)}`"
              :item="item"
              :column="column"
            >
              {{ getCellData(item, column) }}
            </slot>
          </component>
        </td>
      </tr>
    </tbody>
    <tbody
      v-else
      class="noo-entity-table__skeleton"
    >
      <!-- Skeleton Loader -->
      <tr
        v-for="row in 10"
        :key="row"
      >
        <td
          v-for="col in props.columns"
          :key="col.key"
          :style="col.width ? { width: col.width } : {}"
        >
          <div class="noo-entity-table__skeleton__item" />
        </td>
      </tr>
    </tbody>
  </table>
  <div
    v-else
    class="noo-entity-table__empty"
  >
    <slot name="empty">
      <div class="noo-entity-table__empty__inner">
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
</template>

<script
  setup
  lang="ts"
  generic="T extends ApiEntity<TName>, TName extends string = T['_entityName']"
>
import type { ApiEntity } from '@/core/api/api.types'
import type { RouteLocationAsRelativeGeneric } from 'vue-router'
import type { EntityTableColumnType } from './entity-table-helpers'

export interface Props<
  T extends ApiEntity<TName>,
  TName extends string = T['_entityName']
> {
  data: T[] | null
  isLoading?: boolean
  columns: EntityTableColumnType<T>[]
  rowLink?: (item: T) => RouteLocationAsRelativeGeneric
}

const props = defineProps<Props<T>>()

const getCellData = (item: T, column: EntityTableColumnType<T>) => {
  const value = item[column.key as keyof T]

  return column.converter ? column.converter(value) : value
}
</script>

<style scoped lang="sass">
.noo-entity-table
  width: 100%
  border-collapse: collapse

  &__head
    tr
      th
        padding: 0.5em
        text-align: left
        font-weight: normal
        color: var(--text-light)
        border-bottom: 1px solid var(--border-color)

  &__content
    &__row
      border-top: 1px solid var(--border-color)
      vertical-align: middle

      &--is-link
        cursor: pointer

        &:hover
          background: var(--light-background-color)

      &__cell
        padding: 0.5em
        vertical-align: middle

        &__link
          box-sizing: border-box
          display: block
          text-decoration: none
          color: inherit
          width: 100%
          height: 100%

  &__skeleton
    tr
      border-top: 1px solid var(--border-color)

      td
        height: 3em
        padding: 0.5em

        .noo-entity-table__skeleton__item
          background: var(--skeleton-bg)
          border-radius: var(--border-radius)
          width: 100%
          height: 100%
          animation: var(--skeleton-animation)

  &__empty
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    padding: 2em

    &__inner
      text-align: center
      width: max(600px, 90%)
</style>
