<template>
  <div
    class="changelog-change-tag"
    :style="{ backgroundColor }"
  >
    <span class="changelog-change-tag__text">
      {{ label }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { PlatformChangeType } from '../api/platform.types'
import { computed } from 'vue'

interface Props {
  type: PlatformChangeType
}

const props = defineProps<Props>()

const label = computed(() => {
  switch (props.type) {
    case 'feature':
      return 'Новое'
    case 'bug-fix':
      return 'Исправление'
    case 'optimization':
      return 'Улучшение'
    case 'refactor':
      return 'Рефакторинг'
    default:
      return 'Изменение'
  }
})

const backgroundColor = computed(() => {
  switch (props.type) {
    case 'feature':
      return 'var(--success)'
    case 'bug-fix':
      return 'var(--danger)'
    case 'optimization':
      return 'var(--info)'
    case 'refactor':
      return 'var(--text-light)'
    default:
      return 'var(--text-light)'
  }
})
</script>

<style lang="sass" scoped>
.changelog-change-tag
  display: inline-block
  flex-shrink: 0
  font-weight: 500
  font-size: 0.8em
  color: #fff
  border-radius: var(--border-radius)
  padding: 0.1em 0.5em
  white-space: nowrap
</style>
