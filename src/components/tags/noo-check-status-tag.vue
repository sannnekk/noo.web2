<template>
  <div
    class="noo-assigned-work-solve-status"
    :class="{
      'noo-assigned-work-solve-status--not-checked':
        props.status === 'not-checked',
      'noo-assigned-work-solve-status--in-progress':
        props.status === 'in-progress',
      'noo-assigned-work-solve-status--checked': props.status === 'checked'
    }"
  >
    <span class="assigned-work-solve-solve-status__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { AssignedWorkEntity } from '@/modules/assigned-works/api/assigned-work.types'
import { computed } from 'vue'

interface Props {
  status: AssignedWorkEntity['checkStatus']
}

const props = defineProps<Props>()

const statusText = computed(() => {
  switch (props.status) {
    case 'not-checked':
      return 'Не проверена'
    case 'in-progress':
      return 'В процессе'
    case 'checked':
      return 'Проверена'
    default:
      return 'неизвестно'
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
