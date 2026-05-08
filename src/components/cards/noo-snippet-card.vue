<template>
  <div class="noo-snippet-card">
    <div class="noo-snippet-card__header">
      <noo-title
        :size="4"
        no-margin
      >
        {{ snippet.name }}
      </noo-title>
      <noo-text-block
        size="small"
        dimmed
        no-margin
      >
        Создан:
        <noo-date
          timezones="local"
          :value="snippet.createdAt"
          include-time
        />
      </noo-text-block>
    </div>

    <noo-richtext-block
      v-if="!isContentEmpty"
      :value="snippet.content"
    />
    <noo-text-block
      v-else
      dimmed
      size="small"
      no-margin
    >
      Без содержимого.
    </noo-text-block>

    <div
      v-if="$slots.actions"
      class="noo-snippet-card__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { richTextIsEmpty } from '@/core/utils/richtext.utils'
import type { SnippetEntity } from '@/modules/assigned-works/api/snippet.types'
import { computed } from 'vue'

interface Props {
  snippet: SnippetEntity
}

const props = defineProps<Props>()

const isContentEmpty = computed(() => richTextIsEmpty(props.snippet.content))
</script>

<style lang="sass" scoped>
.noo-snippet-card
  width: 100%
  display: flex
  flex-direction: column
  gap: 0.5em
  padding: 1rem
  border-radius: var(--border-radius)
  background-color: var(--light)

  &__header
    display: flex
    flex-direction: column
    gap: 0.25rem

  &__actions
    display: flex
    flex-wrap: wrap
    gap: 0.5rem
    justify-content: flex-end
</style>
