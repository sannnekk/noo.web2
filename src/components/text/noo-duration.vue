<template>
  <span class="noo-duration">
    {{ formattedDuration }}
  </span>
</template>

<script setup lang="ts">
import { DateHelpers } from '@/core/utils/dates'
import { computed } from 'vue'

interface Props {
  from: string | Date | null | undefined
  to: string | Date | null | undefined
}

const props = defineProps<Props>()
const formattedDuration = computed(() =>
  DateHelpers.formatDuration(props.from, props.to)
)
</script>
