<template>
  <span class="noo-tab-counter">
    <noo-loader-icon
      v-if="isLoading"
      contrast
    />
    <span
      v-else-if="count !== undefined"
      class="noo-tab-counter__count"
    >
      ({{ count }})
    </span>
  </span>
</template>

<script lang="ts" setup>
interface Props {
  count?: number
  isLoading?: boolean
}

defineProps<Props>()
</script>
