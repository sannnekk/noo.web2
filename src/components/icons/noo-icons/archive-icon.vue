<template>
  <svg
    :class="{ hoverable }"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect
      x="2.75"
      y="3.25"
      width="18.5"
      height="4.25"
      rx="1.25"
      style="stroke: var(--form-text-color)"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M4.75 7.5V17.75C4.75 19.4069 6.09315 20.75 7.75 20.75H16.25C17.9069 20.75 19.25 19.4069 19.25 17.75V7.5"
      style="stroke: var(--form-text-color)"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.75 11.75H14.25"
      style="stroke: var(--form-text-color)"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass">
svg.hoverable:hover
  --form-text-color: var(--secondary)
  cursor: pointer
</style>
