<template>
  <div class="noo-patch-list">
    <div
      v-for="(change, index) in changes"
      :key="index"
      class="noo-patch-list__item"
    >
      <div class="noo-patch-list__item__title">
        <noo-text-block>
          {{ change.label }}
        </noo-text-block>
      </div>
      <div class="noo-patch-list__item__content">
        <div class="noo-patch-list__item__content__was">
          <slot
            :name="`path-${change.pathKey}`"
            :value="change.prevValue"
          >
            {{ change.prevValue }}
          </slot>
        </div>
        <div class="noo-patch-list__item__content__arrow">→</div>
        <div class="noo-patch-list__item__content__now">
          <slot
            :name="`path-${change.pathKey}`"
            :value="change.nowValue"
          >
            {{ change.nowValue }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { computed } from 'vue'
import { getChanges } from './noo-patch-list.helpers'
import type { PathLabelMap } from './noo-patch-list.types'

interface Props {
  patch: JsonPatchDocument<T>
  original: T
  pathLabels: PathLabelMap<T>
}

const props = defineProps<Props>()

const changes = computed(() =>
  getChanges<T>(props.original, props.patch, props.pathLabels)
)
</script>

<style scoped lang="sass">
.noo-patch-list
  &__item
    display: flex
    flex-direction: row
    flex-wrap: wrap
    padding: 0.1em 1em
    border-radius: var(--border-radius)

    &:nth-child(even)
      background-color: var(--light-background-color)

    &__title
      margin-right: 0.5em

    &__content
      display: flex
      flex-direction: row
      align-items: center
      justify-content: flex-end
      flex: 1
      gap: 0.5em
      padding: 0 0.5em

      &__was,
      &__now
        background-color: var(--code-background)
        padding: 0.5em
        border-radius: var(--border-radius)
        white-space: pre-wrap
        word-break: break-word
        font-family: var(--font-monospace)

      &__arrow
        margin-left: 0.6em
        font-weight: bold
        font-size: 1.2em
        color: var(--text-secondary)
</style>
