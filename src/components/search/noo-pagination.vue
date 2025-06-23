<template>
  <div class="list-pagination">
    <div
      v-for="page in pages"
      :key="page.number"
      class="list-pagination__item"
      :class="{
        'list-pagination__item--ellipsis': page.type === 'ellipsis',
        'list-pagination__item--active': page.number === model
      }"
      @click="model = page.number"
    >
      {{ page.type === 'page' ? page.number : '...' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total?: number
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  total: 1,
  limit: 25
})

const model = defineModel<number>('page', {
  default: 1
})

interface Page {
  number: number
  type: 'page' | 'ellipsis'
}

const pageCount = computed(() => Math.ceil(props.total / props.limit))

const pages = computed(() => {
  return Array.from({ length: pageCount.value }, (_, i) => i + 1)
    .map((page) => {
      if (
        page === 1 ||
        page === pageCount.value ||
        (page >= model.value - 2 && page <= model.value + 2)
      ) {
        return { number: page, type: 'page' }
      }

      return { number: page, type: 'ellipsis' }
    })
    .filter((page, i, arr) => {
      if (page.type === 'ellipsis') {
        return arr[i - 1].type !== 'ellipsis'
      }

      return true
    }) as Page[]
})
</script>

<style lang="sass" scoped>
.list-pagination
  display: flex
  gap: 8px
  padding: 16px 0
  justify-content: center
  align-items: center

  &__item
    display: flex
    align-items: center
    justify-content: center
    max-width: 3.5em
    min-width: 1.5em
    padding: 0 0.5em
    height: 1.5em
    border-radius: var(--border-radius)
    cursor: pointer
    font-size: 1.2em

    &:not(&--ellipsis):not(&--active):hover
      background-color: var(--border-color)

    &--ellipsis
      pointer-events: none
      user-select: none
      color: var(--border-color)
      cursor: default

    &--active
      background-color: var(--lila)
      color: var(--lightest)
</style>
