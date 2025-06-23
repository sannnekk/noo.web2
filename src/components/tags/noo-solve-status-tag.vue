<template>
  <div
    class="noo-assigned-work-solve-status"
    :class="{
      'noo-assigned-work-solve-status--not-solved': props.status === 'not-solved',
      'noo-assigned-work-solve-status--in-progress': props.status === 'in-progress',
      'noo-assigned-work-solve-status--solved': props.status === 'solved'
    }"
  >
    <span class="assigned-work-solve-solve-status__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { AssignedWorkEntity } from '@/modules/assigned-works/api/assigned-work.types';
import { computed } from 'vue';

interface Props {
  status: AssignedWorkEntity['solveStatus']
}

const props = defineProps<Props>()

const statusText = computed(() => {
  switch (props.status) {
    case 'not-solved':
      return 'Не начата'
    case 'in-progress':
      return 'В процессе'
    case 'solved':
      return 'Сдана'
    default:
      return 'неизвестно'
  }
})
</script>

<style lang="sass" scoped>
.noo-assigned-work-solve-status
  display: inline-block
  font-weight: normal

  &--not-solved
    color: var(--text-light)

  &--in-progress
    color: var(--warning)

  &--solved
    color: var(--success)
</style>
