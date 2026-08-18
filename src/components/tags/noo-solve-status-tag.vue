<template>
  <div
    class="noo-solve-status-tag"
    :class="`noo-solve-status-tag--${props.status}`"
  >
    <span class="noo-solve-status-tag__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { SolveStatus } from '@/modules/assigned-works/api/assigned-work.types'
import { computed } from 'vue'

interface Props {
  status: SolveStatus
}

const props = defineProps<Props>()

const statusTexts: Record<SolveStatus, string> = {
  'not-solved': 'Не начата',
  'in-progress': 'В процессе',
  'solved-in-deadline': 'Сдана в дедлайн',
  'solved-after-deadline': 'Сдана после дедлайна'
}

const statusText = computed(() => statusTexts[props.status] ?? 'неизвестно')
</script>

<style lang="sass" scoped>
.noo-solve-status-tag
  display: inline-block
  font-weight: normal

  &--not-solved
    color: var(--text-light)

  &--in-progress
    color: var(--warning)

  &--solved-in-deadline
    color: var(--success)

  &--solved-after-deadline
    color: var(--danger)
</style>
