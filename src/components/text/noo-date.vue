<template>
  <span class="noo-date">
    {{
      timezones === 'both'
        ? currentTz === 'Europe/Moscow'
          ? formattedLocalDate
          : `${formattedLocalDate} / ${formattedMoscowDate} МСК`
        : timezones === 'local'
          ? formattedLocalDate
          : formattedMoscowDate
    }}
  </span>
</template>

<script setup lang="ts">
import { DateHelpers } from '@/core/utils/dates'
import { computed } from 'vue'

interface Props {
  value: string | Date | null | undefined
  timezones?: 'both' | 'local' | 'Europe/Moscow'
  includeTime?: boolean
}

const props = defineProps<Props>()

const formattedMoscowDate = computed(() =>
  DateHelpers.formatDate(props.value, {
    timezone: 'Europe/Moscow',
    includeTime: props.includeTime
  })
)

const formattedLocalDate = computed(() =>
  DateHelpers.formatDistance(props.value, {
    timezone: undefined
  })
)

const currentTz = DateHelpers.getCurrentTimezone()
</script>
