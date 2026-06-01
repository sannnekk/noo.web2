<template>
  <span
    class="noo-date"
    :title="title"
  >
    {{ display }}
  </span>
</template>

<script setup lang="ts">
import { useNow } from '@/core/composables/useNow'
import { DateHelpers } from '@/core/utils/dates'
import { computed } from 'vue'

interface Props {
  value: string | Date | null | undefined
  /**
   * Which timezone(s) to surface:
   * - `local`: messenger-style relative time only (timezone-agnostic)
   * - `Europe/Moscow`: absolute Moscow date/time
   * - `both`: relative time followed by the absolute Moscow date/time
   */
  timezones?: 'both' | 'local' | 'Europe/Moscow'
  includeTime?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  timezones: 'both'
})

const now = useNow()

const userIsInMoscow = DateHelpers.getCurrentTimezone() === 'Europe/Moscow'

const relative = computed(() =>
  DateHelpers.formatRelative(props.value, now.value)
)

const moscowAbsolute = computed(() =>
  DateHelpers.formatDate(props.value, {
    timezone: 'Europe/Moscow',
    includeTime: props.includeTime
  })
)

const localAbsolute = computed(() =>
  DateHelpers.formatDate(props.value, {
    timezone: 'local',
    includeTime: props.includeTime
  })
)

const display = computed(() => {
  switch (props.timezones) {
    case 'local':
      return relative.value
    case 'Europe/Moscow':
      return `${moscowAbsolute.value} МСК`
    case 'both':
    default:
      return userIsInMoscow
        ? `${relative.value} · ${moscowAbsolute.value}`
        : `${relative.value} · ${moscowAbsolute.value} МСК`
  }
})

// Always expose the precise absolute time(s) on hover.
const title = computed(() =>
  userIsInMoscow
    ? `${moscowAbsolute.value} МСК`
    : `${localAbsolute.value} · ${moscowAbsolute.value} МСК`
)
</script>
