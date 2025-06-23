<template>
  <div
    class="noo-assigned-work-solve-status"
    :style="{ color }"
  >
    <span class="assigned-work-solve-solve-status__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { WorkType } from '@/modules/works/api/work.types';
import { computed } from 'vue';

interface Props {
  type: WorkType
}

const props = defineProps<Props>()

const statusText = computed(() => {
  switch (props.type) {
    case 'mini-test':
      return 'Мини-зачет'
    case 'test':
      return 'Тест'
    case 'phrase':
      return 'Фраза'
    case 'second-part':
      return 'Вторая часть'
    case 'trial-work':
      return 'Пробник'
    default:
      return 'Неизвестный тип работы'
  }
})

const color = computed(() => {
  switch (props.type) {
    case 'mini-test':
      return 'var(--text-light)'
    case 'test':
      return 'var(--warning)'
    case 'phrase':
      return 'var(--success)'
    case 'second-part':
      return 'var(--info)'
    case 'trial-work':
      return 'var(--danger)'
    default:
      return 'var(--text-light)'
  }
})
</script>

<style lang="sass" scoped>
.noo-assigned-work-solve-status
  display: inline-block
  font-weight: normal

  &--not-checked
    color: var(--text-light)

  &--in-progress
    color: var(--warning)

  &--checked
    color: var(--success)
</style>
