<template>
  <div
    class="noo-work-type-tag"
    :style="{ color }"
  >
    <span class="noo-work-type-tag__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { WorkType } from '@/modules/works/api/work.types'
import { workTypes } from '@/modules/works/constants'
import { computed } from 'vue'

interface Props {
  type: WorkType
}

const props = defineProps<Props>()

const statusText = computed(
  () =>
    workTypes.find((t) => t.value === props.type)?.label ?? 'Неизвестный тип'
)

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
.noo-work-type-tag
  display: inline-block
  font-weight: normal
</style>
