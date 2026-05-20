<template>
  <img
    v-if="mode === 'light'"
    src="@/assets/nothing-found_light.svg"
    alt="Nothing found"
  />
  <img
    v-else
    src="@/assets/nothing-found_dark.svg"
    alt="Nothing found"
  />
</template>

<script lang="ts" setup>
import { useTheme } from '@/core/composables/useTheme'

const { mode } = useTheme()
</script>

<style scoped lang="sass">
img
  max-width: 100%
</style>
