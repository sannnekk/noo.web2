<template>
  <div
    class="noo-check-status-tag"
    :class="`noo-check-status-tag--${props.status}`"
  >
    <span class="noo-check-status-tag__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { CheckStatus } from '@/modules/assigned-works/api/assigned-work.types'
import { computed } from 'vue'

interface Props {
  status: CheckStatus
}

const props = defineProps<Props>()

const statusTexts: Record<CheckStatus, string> = {
  'not-checked': 'Не проверена',
  'in-progress': 'В процессе',
  'checked-in-deadline': 'Проверена в дедлайн',
  'checked-after-deadline': 'Проверена после дедлайна',
  'checked-automatically': 'Проверена автоматически'
}

const statusText = computed(() => statusTexts[props.status] ?? 'неизвестно')
</script>

<style lang="sass" scoped>
.noo-check-status-tag
  display: inline-block
  font-weight: normal

  &--not-checked
    color: var(--text-light)

  &--in-progress
    color: var(--warning)

  &--checked-in-deadline
    color: var(--success)

  &--checked-after-deadline
    color: var(--danger)

  &--checked-automatically
    color: var(--success)
</style>
